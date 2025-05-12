package com.example.Fstock.mapper;

import com.example.Fstock.dto.request.RolesRequest;
import com.example.Fstock.dto.response.RolesReponse;
import com.example.Fstock.entity.Roles;
import org.mapstruct.Mapper;
@Mapper(componentModel = "spring")
public interface RolesMapper {
    RolesReponse toRolesReponse(Roles roles);
    Roles toRoles(RolesRequest rolesRequest);

}
