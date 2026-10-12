package com.puspo.authZ.dto.alkp;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class AlkpRequest {
    private String label;
    private String type;
    private UUID parentId;
    private String code;
    private String route;
    private String icon;
    private Integer menuOrder;
}