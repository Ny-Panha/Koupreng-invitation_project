# syntax=docker/dockerfile:1.7
FROM eclipse-temurin:25-jdk-jammy AS build
WORKDIR /workspace

COPY .mvn .mvn
COPY mvnw pom.xml ./
RUN chmod +x mvnw && ./mvnw --batch-mode -DskipTests dependency:go-offline

COPY src src
# បន្ថែម -Dtoolchains.skip=true ដើម្បីបិទការឆែក Toolchains ចោល មិនឱ្យវា Error ទៀត
RUN ./mvnw --batch-mode -DskipTests -Dtoolchains.skip=true package

FROM eclipse-temurin:25-jre-jammy AS runtime
RUN apt-get update \
    && apt-get install --yes --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/* \
    && groupadd --system koupreng \
    && useradd --system --gid koupreng --home-dir /app koupreng

WORKDIR /app
COPY --from=build --chown=koupreng:koupreng /workspace/target/backend-*.jar app.jar
RUN mkdir -p /app/uploads && chown koupreng:koupreng /app/uploads

USER koupreng
EXPOSE 8080
ENV JAVA_OPTS="-XX:MaxRAMPercentage=75.0 -XX:+ExitOnOutOfMemoryError"
ENTRYPOINT ["sh", "-c", "exec java $JAVA_OPTS -jar /app/app.jar"]