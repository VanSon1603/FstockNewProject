package com.example.Fstock.entity;

import com.example.Fstock.enums.AccountType;
import com.example.Fstock.enums.Gender;
import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int userId;
    @Column( nullable = false)
    private String firstName;
    @Column( nullable = false)
    private String lastName;
    @Column( nullable = false)
    private String userName;
    @Column( nullable = false)
    private String email;
    @Column( nullable = true)
    private String password;
    @Column( nullable = true)
    private String phone;
    @Column( nullable = true)
    private String imgUrlDisplay;
    @Column( nullable = false)
    @Enumerated(EnumType.STRING)
    private Gender gender;
    @Column( nullable = false)
    private Boolean active;
    @Enumerated(EnumType.STRING)
    private AccountType accountType;

    @OneToMany(cascade = CascadeType.ALL, fetch = FetchType.EAGER, mappedBy = "user", orphanRemoval = true)
    private List<Order> orders;

    @OneToMany(cascade = CascadeType.ALL, fetch = FetchType.EAGER, mappedBy = "user", orphanRemoval = true)
    private List<Cart> carts;

    @OneToMany(cascade = CascadeType.ALL, fetch = FetchType.EAGER, mappedBy = "user", orphanRemoval = true)
    private List<Review> reviews;

    @OneToMany(cascade = CascadeType.ALL, fetch = FetchType.EAGER, mappedBy = "user", orphanRemoval = true)
    private List<User_Roles> userRoles;

    @OneToOne(cascade = CascadeType.ALL, fetch = FetchType.LAZY, mappedBy = "user", orphanRemoval = true)
    private VerificationToken verificationToken;

}
