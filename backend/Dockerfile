# ==============================================================================
# Dockerfile — backend (Quarkus / Java 21)
# ==============================================================================
# Build (a partir da pasta backend/, que é a raiz deste projeto Maven):
#   docker build -t moveis-paje-backend .
#
# Run:
#   docker run -p 9190:9190 \
#     -e DB_URL=jdbc:postgresql://ep-young-water-acjoayuy-pooler.sa-east-1.aws.neon.tech/paje?sslmode=require \
#     -e DB_USER=neondb_owner -e DB_PASSWORD=npg_jiBerdcPo6s7 \
#     moveis-paje-backend
#
# (Para rodar junto com o Postgres via docker-compose, veja o serviço
# "backend" em docker-compose.yml na raiz do repositório — mais fácil.)
# ==============================================================================

# ------------------------------------------------------------------------------
# ETAPA 1: build com Maven
# ------------------------------------------------------------------------------
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app

# Copia só o pom.xml primeiro: essa camada só é invalidada (e as dependências
# só são baixadas de novo) quando o pom.xml muda — não a cada alteração de
# código-fonte. Acelera muito os rebuilds.
COPY pom.xml .
RUN mvn dependency:go-offline -B

COPY src ./src
RUN mvn package -DskipTests -B

# ------------------------------------------------------------------------------
# ETAPA 2: imagem de execução (Quarkus fast-jar — modo de empacotamento padrão)
# ------------------------------------------------------------------------------
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Usuário não-root (boa prática de segurança em containers)
RUN addgroup -S quarkus && adduser -S quarkus -G quarkus

COPY --from=build --chown=quarkus:quarkus /app/target/quarkus-app/lib/ /app/lib/
COPY --from=build --chown=quarkus:quarkus /app/target/quarkus-app/*.jar /app/
COPY --from=build --chown=quarkus:quarkus /app/target/quarkus-app/app/ /app/app/
COPY --from=build --chown=quarkus:quarkus /app/target/quarkus-app/quarkus/ /app/quarkus/

USER quarkus

# 9190 é a porta padrão deste projeto (application.properties: quarkus.http.port=${PORT:9190}).
# Pode ser sobrescrita em runtime com -e PORT=<outra-porta>, sem precisar rebuildar a imagem
# — útil em plataformas cloud (Render, Railway, Fly.io...) que injetam PORT automaticamente.
EXPOSE 9190

# -XX:MaxRAMPercentage evita que a JVM tente usar toda a RAM do host; ajustável
# em runtime via -e JAVA_OPTS="..." sem rebuildar a imagem.
ENV JAVA_OPTS="-XX:MaxRAMPercentage=75.0"

# Forma shell + "exec" (em vez de ENTRYPOINT em array) para permitir a expansão
# de $JAVA_OPTS *e* ainda assim propagar corretamente SIGTERM pro processo Java
# (sem o "exec", o container demoraria ~10s pra parar, esperando o shell morrer).
ENTRYPOINT ["sh", "-c", "exec java $JAVA_OPTS -jar /app/quarkus-run.jar"]
