# Expense Tracker

A modern expense tracking application built with Next.js, MongoDB, and Tailwind CSS.

## Features

- 🎯 **Goal Setting**: Set your bank amount and track spending against it
- 📊 **Visual Reports**: Interactive charts showing daily trends and category breakdowns
- 📱 **Responsive Design**: Works on desktop and mobile devices
- 🌙 **Dark Theme**: Modern black and green color scheme
- 📈 **Multiple Time Periods**: View expenses for 7, 15, 30, or 365 days
- 💾 **MongoDB Storage**: Persistent data storage
- 🚀 **Real-time Updates**: Instant updates when adding new expenses

## Technologies Used

- **Next.js 15** - React framework
- **TypeScript** - Type safety
- **MongoDB** - Database
- **Mongoose** - MongoDB ODM
- **Tailwind CSS** - Styling
- **ApexCharts** - Data visualization
- **React ApexCharts** - Chart components

## Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up MongoDB**:
   - Install MongoDB locally or use MongoDB Atlas
   - Update the connection string in `.env.local`

3. **Run the development server**:
   ```bash
   npm run dev
   ```

4. **Open your browser**:
   - Visit [http://localhost:3000](http://localhost:3000)

## Usage

1. **Set Your Goal**: Enter your current bank amount and start date
2. **Add Expenses**: Use the form to add daily expenses with categories
3. **View Reports**: Switch between different time periods (7, 15, 30, 365 days)
4. **Track Progress**: Monitor your spending against your goal with visual indicators

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── expenses/
│   │   └── goal/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ExpenseChart.tsx
│   ├── ExpenseForm.tsx
│   ├── GoalForm.tsx
│   └── ReportFilters.tsx
├── lib/
│   └── mongodb.ts
└── models/
    ├── Expense.ts
    └── Goal.ts
```

## Environment Variables

Create a `.env.local` file:

```
MONGODB_URI=mongodb://localhost:27017/expense-tracker
```

## License

MIT