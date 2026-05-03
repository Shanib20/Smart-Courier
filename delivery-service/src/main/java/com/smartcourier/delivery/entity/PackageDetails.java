package com.smartcourier.delivery.entity;

import jakarta.persistence.Embeddable;

@Embeddable
public class PackageDetails {

    private Double weightKg;
    private String dimensions;
    private String packageType;
	public Double getWeightKg() {
		return weightKg;
	}
	public void setWeightKg(Double weightKg) {
		this.weightKg = weightKg;
	}
	public String getDimensions() {
		return dimensions;
	}
	public void setDimensions(String dimensions) {
		this.dimensions = dimensions;
	}
	public String getPackageType() {
		return packageType;
	}
	public void setPackageType(String packageType) {
		this.packageType = packageType;
	}
    
}