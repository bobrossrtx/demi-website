FROM ubuntu:22.04 as builder

WORKDIR /demi-website

RUN apt-get update
RUN apt-get -y install curl gnupg ca-certificates build-essential

# Install Node.js 20.x (LTS)
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
RUN apt-get install -y nodejs

RUN curl https://sh.rustup.rs -sSf | bash -s -- -y
ENV PATH="/root/.cargo/bin:${PATH}"

# Define build arguments
ARG REACT_APP_EMAILJS_SERVICE_ID
ARG REACT_APP_EMAILJS_TEMPLATE_ID
ARG REACT_APP_EMAILJS_USER_ID

# Set environment variables
ENV REACT_APP_EMAILJS_SERVICE_ID=$REACT_APP_EMAILJS_SERVICE_ID
ENV REACT_APP_EMAILJS_TEMPLATE_ID=$REACT_APP_EMAILJS_TEMPLATE_ID
ENV REACT_APP_EMAILJS_USER_ID=$REACT_APP_EMAILJS_USER_ID

# Copy only package files first for better layer caching
COPY frontend/package*.json ./frontend/
RUN cd ./frontend && npm install

# Copy frontend source and build
COPY frontend ./frontend
RUN cd ./frontend && npm run build

# Copy only Cargo files first to cache dependencies
COPY backend/Cargo.toml backend/Cargo.lock backend/rust-toolchain ./backend/
COPY backend/Rocket.toml ./backend/
RUN mkdir -p ./backend/src && \
    echo "fn main() {}" > ./backend/src/main.rs && \
    cd backend && \
    cargo build --release && \
    rm -rf ./target/release/.fingerprint/backend-*

# Now copy the actual source and build
COPY backend/src ./backend/src
COPY backend/static ./backend/static
RUN cd backend && \
    cargo build --release

# Use a smaller runtime image
FROM ubuntu:22.04

WORKDIR /app

# Copy only the compiled binary and static files
COPY --from=builder /demi-website/backend/target/release/backend ./backend
COPY --from=builder /demi-website/backend/static ./static
COPY --from=builder /demi-website/backend/Rocket.toml ./Rocket.toml

CMD ["./backend"]