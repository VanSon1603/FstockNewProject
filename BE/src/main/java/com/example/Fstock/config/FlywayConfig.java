//package com.example.Fstock.config;
//
//import org.flywaydb.core.Flyway;
//import org.springframework.beans.factory.annotation.Value;
//import org.springframework.boot.autoconfigure.flyway.FlywayAutoConfiguration;
//import org.springframework.context.annotation.Bean;
//import org.springframework.context.annotation.Configuration;
//import org.springframework.jdbc.datasource.DriverManagerDataSource;
//
//import javax.sql.DataSource;
//
//@Configuration
//public class FlywayConfig {
//    @Value("${spring.flyway.locations}")
//    private String[] locations;
//    @Value("${spring.datasource.url}")
//    private String dataSource;
//    @Value("${spring.datasource.username}")
//    private String username;
//    @Value("${spring.datasource.password}")
//    private String password;
//
//    @Bean
//    public Flyway flyway(){
//        Flyway flyway = Flyway.configure().dataSource(dataSource())
//                .locations(locations)
//                .baselineOnMigrate(true)
//                .baselineVersion("0")// tạo bản ghi trong flyway_schema_history lấy phiên bản hiện tại là baseline
//                .load();
//        flyway.migrate();//chạy các bản ghi version > baseline
//        return flyway;
//    }
//
//    @Bean
//    public DataSource dataSource(){
//        DriverManagerDataSource dataSources = new DriverManagerDataSource();
//        dataSources.setUrl(dataSource);
//        dataSources.setUsername(username);
//        dataSources.setPassword(password);
//        return  dataSources;
//
//    }
//
//}
