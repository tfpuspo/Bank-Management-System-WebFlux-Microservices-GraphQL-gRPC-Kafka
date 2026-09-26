package com.puspo.auth.config;

import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.TopicBuilder;

@Configuration
public class KafkaTopicConfig {

    @Value("${app.kafka.topic.otp-requested}")
    private String otpRequestedTopic;

    @Value("${app.kafka.topic.user-registered}")
    private String userRegisteredTopic;

    @Bean
    public NewTopic otpRequestedTopic() {
        return TopicBuilder.name(otpRequestedTopic).partitions(3).replicas(1).build();
    }

    @Bean
    public NewTopic userRegisteredTopic() {
        return TopicBuilder.name(userRegisteredTopic).partitions(3).replicas(1).build();
    }
}