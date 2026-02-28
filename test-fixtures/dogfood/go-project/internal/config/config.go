package config

type Config struct {
	Port   int
	Debug  bool
	DBHost string
}

func Load() *Config {
	return &Config{
		Port:   8080,
		Debug:  true,
		DBHost: "localhost",
	}
}
