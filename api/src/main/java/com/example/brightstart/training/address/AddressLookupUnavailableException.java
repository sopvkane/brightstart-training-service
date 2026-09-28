package com.example.brightstart.training.address;

public class AddressLookupUnavailableException extends RuntimeException {

    public AddressLookupUnavailableException() {
        super("The synthetic address lookup is deliberately unavailable for this postcode.");
    }
}
