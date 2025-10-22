FROM oven/bun:1
WORKDIR /app
COPY . .
RUN bun install
     
ARG PORT
EXPOSE 5173
     
CMD ["bun", "run", "dev"]