package com.puspo.customer.dto.customer;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class CreateCustomerRequest {
    private String firstName;
    private String lastName;
    private String dateOfBirth;   // ISO date string, e.g. "2000-01-01"
    private String mobileNumber;
    private String email;
    private String nidNumber;
}