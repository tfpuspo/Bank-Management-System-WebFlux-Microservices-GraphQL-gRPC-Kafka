package com.puspo.customer.dto.customer;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CustomerResponse {
    private String id;
    private String firstName;
    private String lastName;
    private String dateOfBirth;
    private String mobileNumber;
    private String email;
    private String nidNumber;
    private String createdAt;
}