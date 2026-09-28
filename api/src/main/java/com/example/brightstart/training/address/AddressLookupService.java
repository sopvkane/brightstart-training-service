package com.example.brightstart.training.address;

import java.util.List;
import java.util.Locale;

import org.springframework.stereotype.Service;

@Service
public class AddressLookupService {

    private final SyntheticAddressSource syntheticAddressSource;

    public AddressLookupService(SyntheticAddressSource syntheticAddressSource) {
        this.syntheticAddressSource = syntheticAddressSource;
    }

    public List<Address> findAddresses(String postcode) {
        String normalisedPostcode = postcode.trim().toUpperCase(Locale.ROOT);

        return syntheticAddressSource.findAddresses(normalisedPostcode);
    }
}
