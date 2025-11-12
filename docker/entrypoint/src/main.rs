use std::os::unix::process::CommandExt;
use std::path::Path;
use std::process::{Command, Stdio};
use std::{env, fs};

use askama::Template;

macro_rules! info {
    ($($arg:tt)*) => {
        println!("[INFO] {}", format!($($arg)*))
    };
}

macro_rules! warn {
    ($($arg:tt)*) => {
        eprintln!("[WARN] {}", format!($($arg)*))
    };
}

macro_rules! error {
    ($($arg:tt)*) => {
        eprintln!("[ERROR] {}", format!($($arg)*))
    };
}

#[cfg(not(debug_assertions))]
const SSL_DIR: &str = "/etc/nginx/certs";
#[cfg(debug_assertions)]
const SSL_DIR: &str = "etc/nginx/certs";

fn create_ssl_dir() {
    let p = Path::new(SSL_DIR);
    if let Err(e) = fs::create_dir_all(p) {
        panic!("Could not create SSL directory {:?}: {}", p, e);
    }
    info!("Created SSL directory {:?}", p);
}

fn create_ssl_certificates() {
    let key_path = Path::new(SSL_DIR).join("key.pem");
    let cert_path = Path::new(SSL_DIR).join("cert.pem");

    if key_path.exists() && cert_path.exists() {
        info!("Both key and cert exist");
        return;
    }

    const C: &str = "DE";
    const ST: &str = "Bayern";
    const L: &str = "Kempten (Allgäu)";
    const O: &str = "FLECS Technologies GmbH";
    const CN: &str = "flecs-webapp.local";
    let dn = format!("/C={C}/ST={ST}/L={L}/O={O}/CN={CN}");

    info!("Creating new SSL certificate");
    let mut openssl_cmd = Command::new("/bin/openssl");

    openssl_cmd
        .env("OPENSSL_CONF", "/dev/null")
        .args(["req", "-x509"])
        .args(["-newkey", "ec"])
        .args(["-pkeyopt", "ec_paramgen_curve:P-256"])
        .args(["-keyout", key_path.to_str().unwrap()])
        .args(["-out", cert_path.to_str().unwrap()])
        .arg("-nodes")
        .arg("-sha256")
        .args(["-days", "3650"])
        .args(["-subj", dn.as_str()])
        .args(["-addext", "basicConstraints=critical,CA:FALSE"])
        .args([
            "-addext",
            "keyUsage=critical,digitalSignature,keyEncipherment",
        ])
        .args(["-addext", "extendedKeyUsage=serverAuth,clientAuth"])
        .stdin(Stdio::null());

    match openssl_cmd.output() {
        Ok(o) => {
            if !o.status.success() {
                error!(
                    "--- stdout: {}",
                    std::str::from_utf8(&o.stdout).unwrap_or("Invalid output")
                );
                error!(
                    "--- stderr: {}",
                    std::str::from_utf8(&o.stderr).unwrap_or("Invalid output")
                );
                panic!("Could not create SSL certificates:");
            }
        }
        Err(e) => {
            panic!("Could not execute openssl: {e}");
        }
    }
}

#[derive(Template)]
#[template(path = "flecs-webapp.conf.jinja2")]
struct WebappConfTemplate<'a> {
    https_port: &'a str,
}

#[cfg(not(debug_assertions))]
const FLECS_WEBAPP_CONFIG_PATH: &str = "/etc/nginx/conf.d/flecs-webapp.conf";
#[cfg(debug_assertions)]
const FLECS_WEBAPP_CONFIG_PATH: &str = "etc/nginx/conf.d/flecs-webapp.conf";

fn create_nginx_config() {
    let https_port = env::var("FLECS_WEBAPP_HTTPS_PORT")
        .ok()
        .map(|v| {
            info!("FLECS_WEBAPP_HTTPS_PORT is set");
            v.parse::<u16>().unwrap_or_else(|e| {
                warn!("FLECS_WEBAPP_HTTPS_PORT does not contain a valid port: {e}");
                443
            })
        })
        .unwrap_or(443);

    let mut https_port = https_port.to_string();
    https_port.insert(0, ':');
    info!("Setting https port to {}", https_port);
    let conf_template = if https_port == ":443" {
        WebappConfTemplate { https_port: "" }
    } else {
        WebappConfTemplate {
            https_port: https_port.as_str(),
        }
    };

    fs::create_dir_all(Path::new(FLECS_WEBAPP_CONFIG_PATH).parent().unwrap())
        .expect("Could not create config directory");
    info!("Created config directory");
    fs::write(FLECS_WEBAPP_CONFIG_PATH, conf_template.to_string())
        .expect("Could not write flecs-webapp.conf");
    info!("Wrote nginx config");
}

fn main() {
    create_ssl_dir();
    create_ssl_certificates();
    create_nginx_config();

    let e = Command::new("/sbin/nginx")
        .args([
            "-g",
            "daemon off;",
            "-e",
            "/dev/stderr",
            "-c",
            "/etc/nginx/nginx.conf",
        ])
        .exec();

    panic!("Could not execute nginx: {e}");
}
