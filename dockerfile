FROM ubuntu:22.04

WORKDIR /demi-website

RUN apt-get update
RUN apt-get -y install curl gnupg ca-certificates

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

COPY . .

# Build frontend
RUN cd ./frontend   && \
    npm install     && \
    npm run build

# Build backend
RUN cd backend              && \
    cargo build --release
CMD cd ./backend && cargo run --release