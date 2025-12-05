# ==============================================================================
# intermediate: Layer that combines all previous artifacts into a 'distroless'
#   image. See 'final' on why this is not yet the final image.
# ==============================================================================
FROM alpine:3 AS staging

# rootfs
COPY --from=flecspublic.azurecr.io/docker/nginx:alpine / /staging/
COPY dist/ /staging/usr/share/nginx/html/
COPY docker/fs/ /staging/

# executables
COPY --from=gcr.io/distroless/static-debian12:debug /busybox/wget /staging/usr/bin/wget

# remove default configuration
RUN rm /staging/etc/nginx/conf.d/default.conf

# ==============================================================================
# final: A simple copy of 'intermediate' base on 'scratch'. This will completely
#   erase the history of our image and yield one single, OSS compliant layer.
# ==============================================================================
FROM scratch AS final

COPY --from=staging /staging /

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD ["/usr/bin/wget", "-q", "--tries=1", "--spider", "http://localhost/health"]

ENTRYPOINT [ \
    "/usr/sbin/nginx", \
    "-g", \
    "daemon off;", \
    "-e", \
    "/dev/stderr", \
    "-c", \
    "/etc/nginx/nginx.conf" \
]
