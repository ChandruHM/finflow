package com.finflow;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class FinFlowJavaApplication {

    public static void main(String[] args) {
        SpringApplication.run(FinFlowJavaApplication.class, args);
    }
}
