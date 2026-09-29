package com.example.brightstart.training.submission;

import org.springframework.stereotype.Service;

@Service
public class SubmissionDecisionService {

    public SubmissionDecision decide() {
        return SubmissionDecision.ACCEPTED;
    }
}
