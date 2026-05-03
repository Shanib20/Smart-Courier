package com.smartcourier.auth.repository;

import com.smartcourier.auth.entity.Address;
import com.smartcourier.auth.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AddressRepository extends JpaRepository<Address, Long> {
    List<Address> findByUser(User user);
    List<Address> findByUserAndDefaultAddressTrue(User user);
}
