package com.puspo.authZ.entity;

import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

import java.util.UUID;

@Getter
@Setter
@Table(schema = "authz", value = "alkp")
public class Alkp {

    @Id
    private UUID id;
    private String label;
    private String type;
    private UUID parentId;
    private String code;
    private String route;
    private String icon;
    private Integer menuOrder;
}