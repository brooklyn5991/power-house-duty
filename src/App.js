import React, { useState, useEffect } from "react";
import { groupMembers, groupSchedule } from "./data";
import "./App.css";
import banner from "./pric.jpg"; // Ensure this path is correct

function App() {
  const [groupInput, setGroupInput] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const today = new Date();

  function parseDate(dateStr) {
    return new Date(dateStr + "T00:00:00");
  }

  function findDutyGroupToday() {
    for (let i = 0; i < groupSchedule.length; i++) {
      const { startDate, endDate, groupOrder, cycle } = groupSchedule[i];
      const start = parseDate(startDate);
      const end = parseDate(endDate);

      if (today >= start && today <= end) {
        const daysSinceStart = Math.floor((today - start) / (1000 * 60 * 60 * 24));
        const groupNum = groupOrder[daysSinceStart];

        if (!groupNum) return null;

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

        return {
          cycle,
          dutyDate: new Date(today),
          lastDutyDate,
          nextDutyDate,
          members: groupMembers[groupNum],
          groupNum,
        };
      }
    }

    return null;
  }

  useEffect(() => {
    const todayDuty = findDutyGroupToday();
    if (todayDuty) {
      setResult(todayDuty);
    }
  }, []);

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
        setResult({ ...dutyInfo, groupNum });
      }
      setLoading(false);
    }, 1000);
  };

  function findGroupDutyDates(groupNum) {
    let dutyInfo = null;

    for (let i = 0; i < groupSchedule.length; i++) {
      const { startDate, endDate, groupOrder, cycle } = groupSchedule[i];
      const start = parseDate(startDate);
      const end = parseDate(endDate);

      if (today >= start && today <= end) {
        const groupIndex = groupOrder.indexOf(groupNum);
        if (groupIndex === -1) continue;

        const dutyDate = new Date(start);
        dutyDate.setDate(dutyDate.getDate() + groupIndex);

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

  function formatDate(date) {
    if (!date) return "N/A";
    return date.toLocaleDateString("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  return (
    <div className={`container ${darkMode ? "dark" : ""}`}>
      <img src={banner} alt="Banner" className="banner" />

      <div className="top-bar">
        <h2>Powerhouse Duty Schedule</h2>
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

      {/* ✅ Show today's duty below the form */}
      {!groupInput && result && (
        <div className="result today-duty">
          <h3>Today's Duty Group: Group {result.groupNum}</h3>
          <p><strong>Cycle:</strong> {result.cycle}</p>
          <p><strong>Duty Date:</strong> {formatDate(result.dutyDate)}</p>
          <p><strong>Group Members:</strong></p>
          <ul>
            {result.members.map((member, idx) => (
              <li key={idx}>{member}</li>
            ))}
          </ul>
        </div>
      )}

      {loading && <div className="loader"></div>}

      {groupInput && result && !loading && (
        <div className="result">
          <p><strong>Cycle:</strong> {result.cycle}</p>
          <p><strong>Group {result.groupNum} Next Duty Date:</strong> {formatDate(result.dutyDate)}</p>
          <p><strong>Last Duty Date:</strong> {formatDate(result.lastDutyDate)}</p>
          {/* <p><strong>Next Duty Date:</strong> {formatDate(result.nextDutyDate)}</p> */}
          <p><strong>Group Members:</strong></p>
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
