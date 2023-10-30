FROM ubuntu:22.04

WORKDIR /demi-website

RUN apt-get update
RUN apt-get -y install curl gnupg
RUN apt-get -y install nodejs npm

RUN curl https://sh.rustup.rs -sSf | bash -s -- -y
ENV PATH="/root/.cargo/bin:${PATH}"

COPY . .

# Build frontend
RUN cd ./frontend   && \
    npm install     && \
    npm run build

# build backend
RUN cd backend              && \
    cargo build --release
CMD cd ./backend && cargo run --release