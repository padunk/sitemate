package main

import (
	"database/sql"
	"log"
	"strconv"

	"github.com/gofiber/fiber/v2"
	_ "github.com/mattn/go-sqlite3"
)

type Issue struct {
	ID          string `json:"id"`
	Title       string `json:"title"`
	Description string `json:"description"`
}

var db *sql.DB

func main() {
	var err error
	db, err = sql.Open("sqlite3", "issue_database.db")
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	createTable()

	app := fiber.New()
	app.Use(func(c *fiber.Ctx) error {
		c.Set("Access-Control-Allow-Origin", "*")
		c.Set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS")
		c.Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		if c.Method() == "OPTIONS" {
			return c.SendStatus(fiber.StatusOK)
		}

		return c.Next()
	})

	v1 := app.Group("/v1")

	v1.Post("/issues", createIssue)
	v1.Get("/issues", getAllIssue)
	v1.Patch("/issues/:id", updateIssue)
	v1.Delete("/issues/:id", deleteIssue)

	log.Fatal(app.Listen(":8080"))
}

func createTable() {
	_, err := db.Exec(`CREATE TABLE IF NOT EXISTS issues (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, description TEXT)`)
	if err != nil {
		log.Fatal(err)
	}
}

func createIssue(c *fiber.Ctx) error {
	issue := new(Issue)
	if err := c.BodyParser(issue); err != nil {
		return c.Status(fiber.StatusBadRequest).
			JSON(fiber.Map{"error": "invalid request body"})
	}

	_, err := db.Exec("INSERT INTO issues (title, description) VALUES (?, ?)", issue.Title, issue.Description)
	if err != nil {
		return err
	}
	return c.SendStatus(fiber.StatusCreated)
}

func getAllIssue(c *fiber.Ctx) error {
	page, _ := strconv.Atoi(c.Query("page", "1"))
	limit, _ := strconv.Atoi(c.Query("limit", "10"))
	offset := (page - 1) * limit

	rows, err := db.Query("SELECT id, title, description FROM issues LIMIT ? OFFSET ?", limit, offset)

	if err != nil {
		return c.Status(fiber.StatusInternalServerError).
			JSON(fiber.Map{"error": "Failed to fetch issues"})
	}
	defer rows.Close()

	var issues []Issue
	for rows.Next() {
		var issue Issue
		if err := rows.Scan(&issue.ID, &issue.Title, &issue.Description); err != nil {
			return c.Status(fiber.StatusInternalServerError).
				JSON(fiber.Map{"error": "Failed to scan issue"})
		}
		issues = append(issues, issue)
	}

	return c.JSON(fiber.Map{
		"page":   page,
		"limit":  limit,
		"issues": issues,
	})
}

func updateIssue(c *fiber.Ctx) error {
	id := c.Params("id")
	issue := new(Issue)
	if err := c.BodyParser(issue); err != nil {
		return c.Status(fiber.StatusBadRequest).
			JSON(fiber.Map{"error": "Invalid body request"})
	}

	_, err := db.Exec("UPDATE issues SET title = ?, description = ? WHERE id = ?", issue.Title, issue.Description, id)

	if err != nil {
		log.Printf("Error udpating issue: %+v", err)
		return c.Status(fiber.StatusInternalServerError).
			JSON(fiber.Map{"error": "Failed to update issue"})
	}

	log.Printf("Updated issue with ID: %s", id)
	return c.SendStatus(fiber.StatusOK)
}

func deleteIssue(c *fiber.Ctx) error {
	id := c.Params("id")

	result, err := db.Exec("DELETE FROM issues WHERE id = ?", id)
	if err != nil {
		log.Printf("Error delteing issue: %v", err)
		return c.Status(fiber.StatusInternalServerError).
			JSON(fiber.Map{"error": "Failed to delete issue"})
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		log.Printf("Error getting rows affected: %v", err)
		return c.Status(fiber.StatusInternalServerError).
			JSON(fiber.Map{"error": "Failed to confirm deletion"})
	}

	if rowsAffected == 0 {
		return c.Status(fiber.StatusNotFound).
			JSON(fiber.Map{"error": "Issue not found"})
	}

	log.Printf("Deleting Issue with ID: %s", id)
	return c.SendStatus(fiber.StatusOK)
}
