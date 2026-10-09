package com.kingofwords;

import jakarta.servlet.http.HttpSession;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseBody;

import java.util.Map;

@Controller
public class GameController {

    private static final String SESSION_WORD = "secretWord";

    private final WordRepository words;

    public GameController(WordRepository words) {
        this.words = words;
    }

    /** Страница 1: приветствие и кнопка «Играть». */
    @GetMapping("/")
    public String welcome() {
        return "index";
    }

    /** Страница 2: выбор из 6 категорий. */
    @GetMapping("/categories")
    public String categories(Model model) {
        model.addAttribute("categories", words.categories());
        return "categories";
    }

    /** Страница 3: загадываем случайное слово, показываем пустые клетки. */
    @GetMapping("/game/{key}")
    public String game(@PathVariable String key, HttpSession session, Model model) {
        WordRepository.Category category = words.category(key);
        if (category == null) {
            return "redirect:/categories";
        }
        String word = WordRepository.normalize(words.randomWord(key));
        // Само слово хранится только на сервере, в браузер уходит лишь его длина
        session.setAttribute(SESSION_WORD, word);
        model.addAttribute("category", category);
        model.addAttribute("length", word.length());
        return "game";
    }

    /** Проверка ответа (вызывается из JS по кнопке «ОК»). */
    @PostMapping("/api/check")
    @ResponseBody
    public Map<String, Object> check(@RequestBody Map<String, String> body, HttpSession session) {
        String secret = (String) session.getAttribute(SESSION_WORD);
        if (secret == null) {
            return Map.of("expired", true);
        }
        String guess = WordRepository.normalize(body.get("guess"));
        boolean correct = secret.equals(guess);
        return Map.of("correct", correct, "word", secret);
    }
}
