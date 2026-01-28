# Build
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY TentotalEnglish.Api/TentotalEnglish.Api.csproj TentotalEnglish.Api/
COPY TentotalEnglish.Application/TentotalEnglish.Application.csproj TentotalEnglish.Application/
COPY TentotalEnglish.Domain/TentotalEnglish.Domain.csproj TentotalEnglish.Domain/
COPY TentotalEnglish.Infrastructure/TentotalEnglish.Infrastructure.csproj TentotalEnglish.Infrastructure/
RUN dotnet restore TentotalEnglish.Api/TentotalEnglish.Api.csproj

COPY . .
RUN dotnet publish TentotalEnglish.Api/TentotalEnglish.Api.csproj -c Release -o /app/publish

# Runtime
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "TentotalEnglish.Api.dll"]
