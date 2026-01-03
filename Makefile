.PHONY: up down db logs backend frontend

up: db
	@echo "Starting application..."
	@echo "Please open two new terminals for backend and frontend:"
	@echo "  make backend"
	@echo "  make frontend"

db:
	docker-compose up -d postgres redis

down:
	docker-compose down

logs:
	docker-compose logs -f

backend:
	cd backend && npm install && npm run dev

frontend:
	cd frontend && npm install && npm run dev
