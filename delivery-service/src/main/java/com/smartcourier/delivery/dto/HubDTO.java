package com.smartcourier.delivery.dto;

public class HubDTO {
    private Long id;
    private String hubCode;
    private String name;
    private String city;

    public HubDTO() {}

    public HubDTO(Long id, String hubCode, String name, String city) {
        this.id = id;
        this.hubCode = hubCode;
        this.name = name;
        this.city = city;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getHubCode() { return hubCode; }
    public void setHubCode(String hubCode) { this.hubCode = hubCode; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }
}
