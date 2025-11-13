# ==============================================================================
# alpine-bash: We use alpine, with shell `bash`. This enables the use of
#   BASH_ENV, which will come in handy later.
# ==============================================================================
FROM alpine:latest AS alpine-bash

RUN apk add --no-cache bash

SHELL ["/bin/bash", "-lc"]

# ==============================================================================
# version-checker: Determine and export latest versions of all dependencies
# ==============================================================================
FROM gcr.io/distroless/static-debian12:debug AS busybox-wget
FROM alpine-bash AS version-checker

RUN apk add --no-cache \
    ca-certificates curl

RUN mkdir -p /usr/local/etc/

# nginx: collect all versions from nginx download page, sort them in reverse
# "version"-order and pick the top one
RUN printf '%s\n' "export NGINX_VERSION=$(curl -s \
    https://nginx.org/en/download.html \
    | grep -oE "nginx-[0-9]+\.[0-9]+\.[0-9]+" \
    | sed 's/nginx-//' \
    | sort -rVu \
    | head -n1)" \
    >> /usr/local/etc/versions.env
RUN grep -E "NGINX_VERSION=.+" /usr/local/etc/versions.env || exit 1

# OpenSSL: First determine the current LTS major.minor version, then find the
# latest patch version for it
RUN MAJOR_VERSION=$(curl -s https://openssl-library.org/source/ \
    | grep -oE '[0-9]\.[0-9]+ \[LTS\]' \
    | sed 's/ \[LTS\]//' \
    | sort -rV \
    | head -n1) \
    && printf '%s\n' "export OPENSSL_VERSION=$(curl -s \
    https://openssl-library.org/source/ \
    | grep -oE "openssl-${MAJOR_VERSION}\.[0-9]+" \
    | sed 's/openssl-//' \
    | sort -rV \
    | head -n1)" \
    >> /usr/local/etc/versions.env
RUN grep -E "OPENSSL_VERSION=.+" /usr/local/etc/versions.env || exit 1

# pcre2: collect all versions from pcre2 releases page, sort them in reverse
# "version"-order and pick the top one
RUN printf '%s\n' "export PCRE2_VERSION=$(curl -s \
    https://github.com/PCRE2Project/pcre2/releases \
    | grep -oE 'pcre2-[0-9]+\.[0-9]+' \
    | cut -d'-' -f2 \
    | sort -rVu \
    | head -n1)" \
    >> /usr/local/etc/versions.env
RUN grep -E "PCRE2_VERSION=.+" /usr/local/etc/versions.env || exit 1

# zlib: collect all versions from zlib download page, sort them in reverse
# "version"-order and pick the top one
RUN printf '%s\n' "export ZLIB_VERSION=$(curl -s https://www.zlib.net/ \
    | grep -oE 'zlib-[0-9]+\.[0-9]+\.[0-9]+' \
    | cut -d'-' -f2 \
    | sort -rVu \
    | head -n1)"\
    >> /usr/local/etc/versions.env
RUN grep -E "ZLIB_VERSION=.+" /usr/local/etc/versions.env || exit 1

# Check busybox version for wget
COPY --from=busybox-wget /busybox/wget /tmp/wget

RUN printf '%s\n' "export BUSYBOX_VERSION=$(/tmp/wget 2>&1 \
    | grep -oE 'v[0-9]\.[0-9]+\.[0-9]+' \
    | sed 's/v//')" \
    >> /usr/local/etc/versions.env
RUN grep -E "BUSYBOX_VERSION=.+" /usr/local/etc/versions.env || exit 1

RUN cat /usr/local/etc/versions.env

# ==============================================================================
# versions-env: Tiny intermediate layer that adds 'versions.env' and sets
#   BASH_ENV to automatically source it.
# ==============================================================================
FROM alpine-bash AS versions-env

COPY --from=version-checker /usr/local/etc/versions.env /usr/local/etc/

ENV BASH_ENV="/usr/local/etc/versions.env"

# ==============================================================================
# nginx-downloader: Layer to download and validate nginx and all of its
#   dependencies to /usr/src. Adds all build tools necessary to build nginx in
#   the next stage.
# ==============================================================================
FROM versions-env AS nginx-downloader

RUN apk add --no-cache \
    gcc ca-certificates ccache curl gpg gpg-agent linux-headers make musl-dev perl wget

WORKDIR /usr/src

ENV CCACHE_DIR=/ccache
ENV PATH="/usr/lib/ccache:${PATH}"

# Download nginx
RUN wget -q https://nginx.org/download/nginx-${NGINX_VERSION}.tar.gz \
    && wget -q https://nginx.org/download/nginx-${NGINX_VERSION}.tar.gz.asc
RUN set -e; \
    export GNUPGHOME="$(mktemp -d)"; \
    curl https://nginx.org/keys/arut.key | gpg --batch --import - \
    && curl https://nginx.org/keys/pluknet.key | gpg --batch --import - \
    && curl https://nginx.org/keys/sb.key | gpg --batch --import - \
    && curl https://nginx.org/keys/thresh.key | gpg --batch --import - \
    && gpg --verify nginx-${NGINX_VERSION}.tar.gz.asc nginx-${NGINX_VERSION}.tar.gz
RUN tar zxf nginx-${NGINX_VERSION}.tar.gz && \
    rm nginx-${NGINX_VERSION}.tar.gz nginx-${NGINX_VERSION}.tar.gz.asc

# Download OpenSSL
ENV OPENSSL_DL_URL=https://github.com/openssl/openssl/releases/download/
RUN wget -q ${OPENSSL_DL_URL}/openssl-${OPENSSL_VERSION}/openssl-${OPENSSL_VERSION}.tar.gz \
    && wget -q ${OPENSSL_DL_URL}/openssl-${OPENSSL_VERSION}/openssl-${OPENSSL_VERSION}.tar.gz.asc
RUN set -e; \
    export GNUPGHOME="$(mktemp -d)"; \
    gpg --recv-keys BA5473A2B0587B07FB27CF2D216094DFD0CB81EF \
    && gpg --verify openssl-${OPENSSL_VERSION}.tar.gz.asc openssl-${OPENSSL_VERSION}.tar.gz
RUN tar zxf openssl-${OPENSSL_VERSION}.tar.gz \
    && rm openssl-${OPENSSL_VERSION}.tar.gz*

# Download pcre2
ENV PCRE2_DL_URL=https://github.com/PCRE2Project/pcre2/releases/download
RUN wget -q ${PCRE2_DL_URL}/pcre2-${PCRE2_VERSION}/pcre2-${PCRE2_VERSION}.tar.gz \
    && wget -q ${PCRE2_DL_URL}/pcre2-${PCRE2_VERSION}/pcre2-${PCRE2_VERSION}.tar.gz.sig
RUN set -e; \
    export GNUPGHOME="$(mktemp -d)"; \
    gpg --recv-keys A95536204A3BB489715231282A98E77EB6F24CA8 \
    && gpg --verify pcre2-${PCRE2_VERSION}.tar.gz.sig pcre2-${PCRE2_VERSION}.tar.gz
RUN tar zxf pcre2-${PCRE2_VERSION}.tar.gz \
    && rm pcre2-${PCRE2_VERSION}.tar.gz*

# Download zlib
RUN wget -q https://www.zlib.net/zlib-${ZLIB_VERSION}.tar.gz \
    && wget -q https://www.zlib.net/zlib-${ZLIB_VERSION}.tar.gz.asc
RUN set -e; \
    export GNUPGHOME="$(mktemp -d)"; \
    gpg --recv-keys 5ED46A6721D365587791E2AA783FCD8E58BCAFBA \
    && gpg --verify zlib-${ZLIB_VERSION}.tar.gz.asc zlib-${ZLIB_VERSION}.tar.gz
RUN tar zxf zlib-${ZLIB_VERSION}.tar.gz \
    && rm zlib-${ZLIB_VERSION}.tar.gz*

RUN gpgconf --kill all || true \
    && rm -rf /root/.gnupg

# ==============================================================================
# nginx-builder: Build nginx and its dependencies as static binary
# ==============================================================================
FROM nginx-downloader AS nginx-builder

RUN cd /usr/src/nginx-${NGINX_VERSION} && ./configure \
    --prefix=/opt/nginx \
    --with-cc-opt="-static -static-libgcc" \
    --with-ld-opt="-static" \
    --with-http_ssl_module \
    --without-http_auth_basic_module \
    --with-pcre=../pcre2-${PCRE2_VERSION} \
    --with-zlib=../zlib-${ZLIB_VERSION} \
    --with-openssl=../openssl-${OPENSSL_VERSION} \
    --with-openssl-opt=no-shared

RUN --mount=type=cache,target=/ccache,id=ccache \
    cd /usr/src/nginx-${NGINX_VERSION} && make -j$(nproc)
RUN cd /usr/src/nginx-${NGINX_VERSION} && strip --strip-unneeded objs/nginx
RUN cd /usr/src/nginx-${NGINX_VERSION} && make install

# ==============================================================================
# openssl-builder: Build standalone openssl executable as static binary
# ==============================================================================
FROM nginx-downloader AS openssl-builder

RUN cd /usr/src/openssl-${OPENSSL_VERSION} \
    && ./Configure no-shared -static
    
RUN --mount=type=cache,target=/ccache,id=ccache \
    cd /usr/src/openssl-${OPENSSL_VERSION} \
    && make -j$(nproc) build_programs

RUN cd /usr/src/openssl-${OPENSSL_VERSION} \
    && strip --strip-unneeded apps/openssl

RUN cd /usr/src/openssl-${OPENSSL_VERSION} \
    && cp apps/openssl /openssl

# ==============================================================================
# license-info: Acquire Debian 'copyright' files of all dependencies directly
#   from their ftp server. Exact version matches might not be possible as we
#   always use the most recent one, while Debian provides only those versions
#   which are part of a major release. Therefore we hardcode them and have to
#   remember to check them periodically, though changes are unlikely to occur.
# ==============================================================================
FROM nginx-downloader AS license-info

ENV DEB_FTP_URL=https://metadata.ftp-master.debian.org/changelogs//main
RUN mkdir -p /usr/local/share/doc/busybox-wget \
    && wget -q ${DEB_FTP_URL}/b/busybox/busybox_1.37.0-6_copyright \
        -O /usr/local/share/doc/busybox-wget/copyright \
    && sed -i '/^Upstream-Name:/d' /usr/local/share/doc/busybox-wget/copyright \
    && sed -i '/^Upstream-Contact:/d' /usr/local/share/doc/busybox-wget/copyright

RUN mkdir -p /usr/local/share/doc/nginx-static \
    && cp /usr/src/nginx-${NGINX_VERSION}/LICENSE /usr/local/share/doc/nginx-static/LICENSE
RUN wget -q ${DEB_FTP_URL}/n/nginx/nginx_1.28.0-6_copyright \
        -O /usr/local/share/doc/nginx-static/copyright \
    && sed -i '/^Upstream-Name:/d' /usr/local/share/doc/nginx-static/copyright \
    && sed -i '/^Upstream-Contact:/d' /usr/local/share/doc/nginx-static/copyright

RUN mkdir -p /usr/local/share/doc/openssl-static \
    && cp /usr/src/openssl-${OPENSSL_VERSION}/LICENSE.txt /usr/local/share/doc/openssl-static/LICENSE
RUN wget -q ${DEB_FTP_URL}/o/openssl/openssl_3.5.4-1_copyright \
        -O /usr/local/share/doc/openssl-static/copyright \
    && sed -i '/^Upstream-Name:/d' /usr/local/share/doc/openssl-static/copyright \
    && sed -i '/^Upstream-Contact:/d' /usr/local/share/doc/openssl-static/copyright

RUN mkdir -p /usr/local/share/doc/pcre2-static \
    && cp /usr/src/pcre2-${PCRE2_VERSION}/LICENCE.md /usr/local/share/doc/pcre2-static/LICENSE
RUN wget -q ${DEB_FTP_URL}/p/pcre2/pcre2_10.47-2_copyright \
        -O /usr/local/share/doc/pcre2-static/copyright \
    && sed -i '/^Upstream-Name:/d' /usr/local/share/doc/pcre2-static/copyright \
    && sed -i '/^Upstream-Contact:/d' /usr/local/share/doc/pcre2-static/copyright

RUN mkdir -p /usr/local/share/doc/zlib-static \
    && cp /usr/src/zlib-${ZLIB_VERSION}/LICENSE /usr/local/share/doc/zlib-static/LICENSE
RUN wget -q ${DEB_FTP_URL}/z/zlib/zlib_1.3.dfsg+really1.3.1-1_copyright \
        -O /usr/local/share/doc/zlib-static/copyright \
    && sed -i '/^Upstream-Name:/d' /usr/local/share/doc/zlib-static/copyright \
    && sed -i '/^Upstream-Contact:/d' /usr/local/share/doc/zlib-static/copyright

RUN mkdir -p /usr/local/share/doc/tzdata/ \
    && wget https://metadata.ftp-master.debian.org/changelogs//main/t/tzdata/tzdata_2025b-5_copyright \
        -O /usr/local/share/doc/tzdata/copyright

# ==============================================================================
# sbom-info: Create dummy entries for each dependency in /var/lib/dpkg. SBOM
#   scanners such as syft are able to extract this information when scanning
#   the final image.
# ==============================================================================
FROM versions-env AS sbom-info

RUN mkdir -p /var/lib/dpkg/status.d/

RUN printf '%s\n'\
    'Package: busybox-wget'\
    "Version: ${BUSYBOX_VERSION}"\
    > /var/lib/dpkg/status.d/busybox-wget

RUN printf '%s\n'\
    'Package: nginx-static'\
    "Version: ${NGINX_VERSION}-static"\
    > /var/lib/dpkg/status.d/nginx-static

RUN printf '%s\n'\
    'Package: openssl-static'\
    "Version: ${OPENSSL_VERSION}-static"\
    > /var/lib/dpkg/status.d/openssl-static

RUN printf '%s\n'\
    'Package: pcre2-static'\
    "Version: ${PCRE2_VERSION}-static"\
    > /var/lib/dpkg/status.d/pcre2-static

RUN printf '%s\n'\
    'Package: zlib-static'\
    "Version: ${ZLIB_VERSION}-static"\
    > /var/lib/dpkg/status.d/zlib-static

# ==============================================================================
# entrypoint: As we go distroless, we no longer have a shell to execute custom
#   entrypoints. Add a small Rust helper that takes care of container
#   initialization and starts our actual binary.
# ==============================================================================
FROM rust:alpine AS entrypoint

ARG TARGETPLATFORM

RUN apk add musl-dev

ADD docker/entrypoint/ /usr/src/entrypoint

WORKDIR /usr/src/entrypoint

ENV RUSTFLAGS="-C target-feature=+crt-static -C link-arg=-static"

RUN if [ "${TARGETPLATFORM}" = "linux/amd64" ]; then \
        CARGO_BUILD_TARGET="x86_64-unknown-linux-musl"; \
    elif [ "${TARGETPLATFORM}" = "linux/arm64" ]; then \
        CARGO_BUILD_TARGET="aarch64-unknown-linux-musl"; \
    else \
        echo "Unsupported platform ${TARGETPLATFORM}"; \
        exit 1; \
    fi \
    && rustup target add ${CARGO_BUILD_TARGET} \
    && cargo build --profile release --target ${CARGO_BUILD_TARGET} \
    && cp ./target/${CARGO_BUILD_TARGET}/release/entrypoint /entrypoint

# ==============================================================================
# intermediate: Layer that combines all previous artifacts into a 'distroless'
#   image. See 'final' on why this is not yet the final image.
# ==============================================================================
FROM gcr.io/distroless/static-debian12:latest AS intermediate

COPY --from=busybox-wget /busybox/wget /usr/bin/wget
COPY --from=nginx-builder /opt/nginx/sbin/nginx /sbin/nginx
COPY --from=nginx-builder /opt/nginx/conf/ /etc/nginx/
COPY --from=openssl-builder /openssl /bin/openssl
COPY --from=license-info /usr/local/share/doc/ /usr/share/doc/
COPY --from=sbom-info /var/lib/dpkg/status.d/ /var/lib/dpkg/status.d/
COPY --from=entrypoint /entrypoint /entrypoint
COPY docker/fs/ /
COPY dist/ /usr/share/nginx/html/ui/

# ==============================================================================
# final: A simple copy of 'intermediate' base on 'scratch'. This will completely
#   erase the history of our image and yield one single, OSS compliant layer.
# ==============================================================================
FROM scratch AS final

COPY --from=intermediate / /

LABEL org.opencontainers.image.authors="FLECS Technologies GmbH <info@flecs.tech>"
LABEL org.opencontainers.image.documentation="https://docs.flecs.tech/"
LABEL org.opencontainers.image.licenses="Apache-2.0 AND BSD-2-Clause AND BSD-3-Clause-PCRE AND MIT AND Zlib"
LABEL org.opencontainers.image.source="https://github.com/FLECS-Technologies/flecs-webapp"
LABEL org.opencontainers.image.title="FLECS WebApp based on nginx (static, musl)"

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD ["/usr/bin/wget", "-q", "--tries=1", "--spider", "http://localhost/health"]

ENTRYPOINT ["/entrypoint"]
