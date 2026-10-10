package com.puspo.authZ.serviceImpl;

import com.puspo.authZ.dto.alkp.AlkpRequest;
import com.puspo.authZ.dto.alkp.AlkpResponse;
import com.puspo.authZ.entity.Alkp;
import com.puspo.authZ.repository.AlkpRepository;
import com.puspo.authZ.service.AlkpService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AlkpServiceImpl implements AlkpService {

    private final AlkpRepository alkpRepository;
    private final ModelMapper modelMapper;

    @Override
    public Mono<AlkpResponse> create(AlkpRequest request) {
        Alkp alkp = new Alkp();
        alkp.setLabel(request.getLabel());
        alkp.setType(request.getType());
        alkp.setParentId(request.getParentId());
        alkp.setCode(request.getCode());
        alkp.setRoute(request.getRoute());
        alkp.setIcon(request.getIcon());
        alkp.setMenuOrder(request.getMenuOrder());
        return alkpRepository.save(alkp)
                .map(saved -> modelMapper.map(saved, AlkpResponse.class));
    }

    @Override
    public Flux<AlkpResponse> findAll() {
        return alkpRepository.findAll()
                .map(alkp -> modelMapper.map(alkp, AlkpResponse.class));
    }

    @Override
    public Flux<AlkpResponse> findByType(String type) {
        return alkpRepository.findByType(type)
                .map(alkp -> modelMapper.map(alkp, AlkpResponse.class));
    }

    @Override
    public Flux<AlkpResponse> search(String type, String label) {
        boolean hasType = StringUtils.hasText(type);
        boolean hasLabel = StringUtils.hasText(label);

        Flux<Alkp> result;
        if (hasType && hasLabel) {
            result = alkpRepository.findByTypeAndLabelContainingIgnoreCase(type, label);
        } else if (hasType) {
            result = alkpRepository.findByType(type);
        } else if (hasLabel) {
            result = alkpRepository.findByLabelContainingIgnoreCase(label);
        } else {
            result = alkpRepository.findAll();
        }
        return result.map(alkp -> modelMapper.map(alkp, AlkpResponse.class));
    }

    @Override
    public Mono<Void> delete(UUID id) {
        return alkpRepository.deleteById(id);
    }
}