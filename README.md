# Travel-Itinerary-Project
🌍 Collaborative Travel Itinerary & Expense Manager

A command-line (CLI) application built with TypeScript that helps travelers plan trips, manage activities, and track expenses.
This project focuses on arrays, async programming, and clean architecture using team collaboration.

👥 Team Roles--

1️⃣ Destination Service - Sonal 
Responsible for:-
Fetching country data from an external API
Returning clean formatted data (not raw API response)
Handling async/await + errors safely

2️⃣ Itinerary Engine - Navya
Responsible for:
Creating trips
Adding activities
Filtering & sorting activities
Managing trip storage (in-memory)

3️⃣ Budget Manager -Priyanka
Responsible for:
Calculating total trip cost
Identifying high-cost activities
Optional: totals per category

🧠 User Stories
#. The app should allow a traveler to:
1. Tracks expenses and calculates totals
2. Create a new trip (destination + start date)
3. Add activities (name, cost, category, time)
4. View activities for a specific day
5. Calculate total trip cost
6. Filter activities by category
7. Fetch country info (currency + flag)
8. Identify high-cost activities
9. View activities sorted chronologically
