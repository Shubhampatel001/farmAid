package com.farmaid.repository;

import com.farmaid.model.Feedback;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FeedbackRepository extends JpaRepository<Feedback, Long> {

	@EntityGraph(attributePaths = "user")
	List<Feedback> findAllByOrderByDateDescFeedbackIdDesc();

	@EntityGraph(attributePaths = "user")
	List<Feedback> findByUserUserIdOrderByDateDescFeedbackIdDesc(Long userId);
}
