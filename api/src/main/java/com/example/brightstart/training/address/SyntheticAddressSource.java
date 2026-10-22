package com.example.brightstart.training.address;

import java.util.List;

import org.springframework.stereotype.Component;

@Component
public class SyntheticAddressSource {

    public List<Address> findAddresses(String postcode) {
        return switch (postcode) {
            case "BT9 7EP" -> List.of(
                    new Address(
                            "bt9-7ep-1",
                            "1 Apprentice Avenue",
                            "Learning Quarter",
                            "Belfast",
                            "BT9 7EP"),
                    new Address(
                            "bt9-7ep-2",
                            "2 Pair Programming Place",
                            "Learning Quarter",
                            "Belfast",
                            "BT9 7EP"),
                    new Address(
                            "bt9-7ep-3",
                            "3 Test Driven Terrace",
                            "Learning Quarter",
                            "Belfast",
                            "BT9 7EP"));
            case "ZZ1 1ZZ" -> List.of(
                    new Address("zz1-1zz-1", "1 Learning Lane", "", "Exampleton", "ZZ1 1ZZ"));
            case "ZZ2 2ZZ" -> List.of(
                    new Address(
                                "zz2-2zz-1",
                                "4 Backend Boulevard",
                                "Service Quarter",
                                "Exampleton",
                                "ZZ2 2ZZ"),
                    new Address(
                                 "zz2-2zz-2",
                                 "5 API Avenue",
                                 "Service Quarter",
                                 "Exampleton",
                                 "ZZ2 2ZZ"));
            case "ZZ9 9ZZ" -> throw new AddressLookupUnavailableException();
            default -> List.of();
        };
    }
}
