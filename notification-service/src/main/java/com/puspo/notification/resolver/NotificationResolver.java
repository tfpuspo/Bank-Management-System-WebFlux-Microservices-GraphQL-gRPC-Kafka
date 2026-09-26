package com.puspo.notification.resolver;

import com.puspo.notification.service.SmsService;
import com.puspo.notification.service.SmsServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class NotificationResolver {

    private final SmsServiceImpl smsServiceImpl;

    @GetMapping("/sms")
    public List<SmsServiceImpl.SentSms> sentMessages() {
        return smsServiceImpl.getSentMessages();
    }
}