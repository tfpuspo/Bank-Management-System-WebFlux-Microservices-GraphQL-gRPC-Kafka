package com.puspo.customer.dto.customer;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class CreateCustomerRequest {
    private String firstName;
    private String lastName;
    private String dateOfBirth;   
    private String mobileNumber;
    private String email;
    private String nidNumber;
}