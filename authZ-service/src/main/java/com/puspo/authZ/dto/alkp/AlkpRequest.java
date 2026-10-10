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

    // MENU-only — see Alkp.java for what each means.
    private String route;
    private String icon;
    private Integer menuOrder;
}