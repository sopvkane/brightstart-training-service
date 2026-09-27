package com.example.brightstart.training.address;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/addresses")
public class AddressController {

    private final AddressLookupService addressLookupService;

    public AddressController(AddressLookupService addressLookupService) {
        this.addressLookupService = addressLookupService;
    }

    @GetMapping
    public AddressLookupResponse findAddresses(@RequestParam String postcode) {
        return new AddressLookupResponse(addressLookupService.findAddresses(postcode));
    }
}
