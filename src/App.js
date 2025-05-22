import React, { useState } from "react";
import { groupMembers, groupSchedule } from "./data";
import "./App.css";

function App() {
  const [groupInput, setGroupInput] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const today = new Date("2025-05-22"); // Use new Date() for live mode

  function parseDate(dateStr) {
    return new Date(dateStr + "T00:00:00");
  }

  function findGroupDutyDates(groupNum) {
    let dutyInfo = null;

    for (let i = 0; i < groupSchedule.length; i++) {
      const { startDate, endDate, groupOrder, cycle } = groupSchedule[i];
      const start = parseDate(startDate);
      const end = parseDate(endDate);

      if (today >= start && today <= end) {
        const todayGroupIndex = groupOrder.indexOf(groupNum);
        if (todayGroupIndex === -1) continue;

        const dutyDate = new Date(start);
        dutyDate.setDate(dutyDate.getDate() + todayGroupIndex);

        // Last cycle
        let lastDutyDate = null;
        let lastCycleIndex = i - 1;
        if (lastCycleIndex < 0) lastCycleIndex = groupSchedule.length - 1;
        const lastCycle = groupSchedule[lastCycleIndex];
        const lastStart = parseDate(lastCycle.startDate);
        const lastGroupIndex = lastCycle.groupOrder.indexOf(groupNum);
        if (lastGroupIndex !== -1) {
          lastDutyDate = new Date(lastStart);
          lastDutyDate.setDate(lastDutyDate.getDate() + lastGroupIndex);
        }

        // Next cycle
        let nextDutyDate = null;
        let nextCycleIndex = i + 1;
        if (nextCycleIndex >= groupSchedule.length) nextCycleIndex = 0;
        const nextCycle = groupSchedule[nextCycleIndex];
        const nextStart = parseDate(nextCycle.startDate);
        const nextGroupIndex = nextCycle.groupOrder.indexOf(groupNum);
        if (nextGroupIndex !== -1) {
          nextDutyDate = new Date(nextStart);
          nextDutyDate.setDate(nextDutyDate.getDate() + nextGroupIndex);
        }

        dutyInfo = {
          cycle,
          dutyDate,
          lastDutyDate,
          nextDutyDate,
          members: groupMembers[groupNum],
        };
        break;
      }
    }
    return dutyInfo;
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    const groupNum = Number(groupInput);
    if (groupNum < 1 || groupNum > 8 || isNaN(groupNum)) {
      alert("Enter a valid group number between 1 and 8");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const dutyInfo = findGroupDutyDates(groupNum);
      if (!dutyInfo) {
        alert("Duty info not found for this group on the selected date.");
      } else {
        setResult(dutyInfo);
      }
      setLoading(false);
    }, 1000); // Simulate delay
  };

  function formatDate(date) {
    if (!date) return "N/A";
    return date.toLocaleDateString("en-GB", {
      weekday: "long", // <-- Add day of week
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  return (
    <div className={`container ${darkMode ? "dark" : ""}`}>
      <div className="top-bar">
        <h2>Group Duty Schedule</h2>
        <button className="toggle" onClick={() => setDarkMode(!darkMode)}>
          {darkMode ? "🌞 Light Mode" : "🌙 Dark Mode"}
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <label htmlFor="groupInput">Enter group number (1 to 8):</label>
        <input
          id="groupInput"
          type="number"
          min="1"
          max="8"
          value={groupInput}
          onChange={(e) => setGroupInput(e.target.value)}
          required
        />
        <button type="submit">Check Duty</button>
      </form>

      {loading && <div className="loader"></div>}

      {result && !loading && (
        <div className="result">
          <p>
            <strong>Cycle:</strong> {result.cycle}
          </p>
          <p>
            <strong>Group {groupInput} Duty Date:</strong>{" "}
            {formatDate(result.dutyDate)}
          </p>
          <p>
            <strong>Last Duty Date:</strong> {formatDate(result.lastDutyDate)}
          </p>
          <p>
            <strong>Next Duty Date:</strong> {formatDate(result.nextDutyDate)}
          </p>
          <p>
            <strong>Group Members:</strong>
          </p>
          <ul>
            {result.members.map((member, idx) => (
              <li key={idx}>{member}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;
