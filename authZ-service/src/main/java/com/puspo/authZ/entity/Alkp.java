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

    // Short prefix used to build a subject's login userId, e.g. "CU", "TL", "BM".
    // Only meaningful on rows where type == "ROLE".
    //
    // Reused on rows where type == "MENU": there it holds the *label* of the
    // PERMISSION row that must be present in a subject's resolved permissions
    // for this menu node to be visible. Null means "always visible" (a pure
    // grouping node, or a landing page everyone who's logged in can reach).
    private String code;

    // --- MENU-only fields below. Null/ignored for every other type. ---

    // Lookup key into the frontend's PAGE_COMPONENTS registry (see menuRegistry.tsx).
    // Null on a pure grouping node (a node that exists only to hold submenus,
    // like "Access Control") — it renders as an expandable group, not a link.
    private String route;

    // Icon name shown next to the label in the sidebar (e.g. "users", "shield", "bank").
    private String icon;

    // Sort order among sibling menu nodes (same parentId). Lower first.
    private Integer menuOrder;
}