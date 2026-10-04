package com.farmaid.service;

import com.farmaid.dto.FeedbackDtos.FeedbackRequest;
import com.farmaid.dto.FeedbackDtos.FeedbackResponse;
import com.farmaid.exception.AppMessages;
import com.farmaid.exception.ResourceNotFoundException;
import com.farmaid.mapper.Mappers;
import com.farmaid.model.Feedback;
import com.farmaid.repository.FeedbackRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class FeedbackService {

	private final FeedbackRepository feedbackRepository;
	private final UserService userService;

	public FeedbackService(FeedbackRepository feedbackRepository, UserService userService) {
		this.feedbackRepository = feedbackRepository;
		this.userService = userService;
	}

	@Transactional
	public FeedbackResponse create(Long userId, FeedbackRequest request) {
		Feedback feedback = new Feedback();
		feedback.setUser(userService.find(userId));
		feedback.setFeedbackText(request.feedbackText().trim());
		feedback.setRating(request.rating());
		feedback.setDate(LocalDate.now());
		return Mappers.toFeedbackResponse(feedbackRepository.save(feedback));
	}

	@Transactional(readOnly = true)
	public List<FeedbackResponse> listAll() {
		return feedbackRepository.findAllByOrderByDateDescFeedbackIdDesc().stream().map(Mappers::toFeedbackResponse).toList();
	}

	@Transactional(readOnly = true)
	public List<FeedbackResponse> listForUser(Long userId) {
		return feedbackRepository.findByUserUserIdOrderByDateDescFeedbackIdDesc(userId).stream()
				.map(Mappers::toFeedbackResponse)
				.toList();
	}

	/** Only the author can delete their feedback; others get 404 so feedback ids are not revealed. */
	@Transactional
	public void delete(Long feedbackId, Long userId) {
		Feedback feedback = feedbackRepository.findById(feedbackId)
				.orElseThrow(() -> new ResourceNotFoundException(AppMessages.FEEDBACK_NOT_FOUND));
		if (!feedback.getUser().getUserId().equals(userId)) {
			throw new ResourceNotFoundException(AppMessages.FEEDBACK_NOT_FOUND);
		}
		feedbackRepository.delete(feedback);
	}
}
