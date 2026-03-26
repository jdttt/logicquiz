$(document).ready(function() {

    function shuffle<T>(array: T[]): T[] {
	if (array.length == 1) return array;
	for (let i = array.length - 1; i > 0; i--) {
	    // Generate a random index 'j' from 0 to 'i'
	    const j = Math.floor(Math.random() * (i + 1));

	    // Swap elements at indices 'i' and 'j'
	    // This uses array destructuring for a concise swap
	    [array[i], array[j]] = [array[j], array[i]]; 
	}
	return array;
    }

    interface Answer {
	"@correct": string;
	"#text": string;
    }

    interface Question {
	content: string;
	explanation: string;
	answer?: Answer[];
	"@flash"?: string;
	study?: string;
    }

    // globals <October 04, 2025> // 
    let quizQuestions: Question[] = [];
    let currentIndex = 0;

    function handleMarkdown(raw: string): string {
	raw = raw
	    .replace(/\[([\w\s]+)\]\(([^)]+)\)/g,`<a href="$2" target="_blank">$1</a>`)
	    .replace(/\*(.*?)\*/sg, "<i>$1</i>")
	    .replace(/\*\*(.*?)\*\*/sg, "<b>$1</b>")
	    .replace(/\n\s*\n/g, "<br><br>")
	    .replace(/---/g, "&mdash;");
	return raw;
    }

    function loadQuestion(index: number) {
	let q: Question = quizQuestions[index];
	console.log("question: ", q)
	$("#question").html(("@flash" in q ? '<div class="instruction">NOTE: This is a flash card! It is meant to train your memory! Try to think of the answer without looking at any resource!<br><br></div>' : "") + handleMarkdown(q.content));
	$("#quiz").empty();
	$("#feedback").hide().text("");
	$("#nextBtn").addClass("hidden");

	if ("@flash" in q) {
	    $("#quiz").append(
		`<label><input type="radio" name="answer" value="0">Show Answer</label><br>`
	    );
	} else {
	    try {
		shuffle(q.answer).forEach((ans, i) => {
		    $("#quiz").append(
			`<label>
			<input type="radio" name="answer" value="${i}">
			${handleMarkdown(ans["#text"])}
			</label><br>`
		    );
		});
	    } catch {
		console.log("Error with this answer: ", q.answer)
	    }
	}
    }

    // Handle answer selection
    $("#quiz").on("change", "input[type=radio]", function() {
	let selectedIndex = $(this).val();
	let feedbackDiv = $("#feedback");

	feedbackDiv.show();
	let feedbackText: string = handleMarkdown(quizQuestions[currentIndex].explanation)


	    if ("@flash" in quizQuestions[currentIndex]) {
		feedbackDiv.removeClass("correct partial incorrect").addClass("flash"); 
		feedbackDiv.html(`<p>${feedbackText}</p>`);
		if ("study" in quizQuestions[currentIndex]) {
		    feedbackDiv.append(`<p><div class="study">FURTHER STUDY: ${handleMarkdown(quizQuestions[currentIndex].study)}</div></p>`);
		}
	    } else {
		try {
		    let selectedAnswer = quizQuestions[currentIndex].answer[selectedIndex];
		    if (selectedAnswer["@correct"] === "1") {
			feedbackDiv.removeClass("partial incorrect flash").addClass("correct");
			feedbackDiv.html("<p>Correct!</p>" + `<p>${feedbackText}</p>`);
		    } else if (selectedAnswer["@correct"] === "0.5") {
			feedbackDiv.removeClass("correct incorrect flash"). addClass("partial"); 
			feedbackDiv.html("<p>Only partially correct. (Read feedback carefully!)</p>" + `<p>${feedbackText}</p>`);
		    } else {
			feedbackDiv.removeClass("flash correct partial").addClass("incorrect");
			feedbackDiv.html("Incorrect.\n\n" + `<p>${feedbackText}</p>`);
		    }
		} catch {
		    console.log("Error accessing answer of this question: ", quizQuestions[currentIndex])
		}
	    }


	$("#nextBtn").removeClass("hidden");
    });

    // Handle next question
    $("#nextBtn").on("click", function(e) {
	e.preventDefault();
	currentIndex++;
	if (currentIndex < quizQuestions.length) {
	    loadQuestion(currentIndex);
	} else {
	    $("#container").css({
		'border': 'none',
	    });
	    $('body').css({
		'background-image': 'url("../quizComplete.jpg")',
		'background-size': '100% 100%',
		'background-repeat': 'no-repeat',
		'height': '80vh',
		'margin': '0'
	    });
	    $("#question").empty();
	    $("#quiz").empty();
	    $("#feedback").hide();
	    $(this).addClass("hidden");
	}
	// const dummy = document.createElement("div");
	// dummy.style.position = "absolute";
	// dummy.style.opacity = "0";
	// document.body.appendChild(dummy);
	// dummy.focus();
	setTimeout(() => { 
	    if (window.scrollY > 0) {
		window.scrollTo(0,0)
	    }
	}, 1000);
    });


    // quiz.json gets replaced by perl, so don't alter it unless you're going to monkey with the Makefile <October 23, 2025> // 
    $.getJSON("quiz.json", function(object) {
	quizQuestions = shuffle(object.quiz.q);
	console.log(quizQuestions)
	loadQuestion(currentIndex);
    });
});
