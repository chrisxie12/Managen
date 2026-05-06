import React, { createContext, useContext, useState, useEffect } from 'react';

const LocalizationContext = createContext();

export const countryConfigs = {
  GH: {
    name: 'Ghana',
    currency: 'GHS',
    currencySymbol: '₵',
    gradingScale: [
      { grade: "A1", range: "80 – 100", desc: "Distinction" },
      { grade: "B2", range: "70 – 79", desc: "Very Good" },
      { grade: "C4", range: "60 – 69", desc: "Credit" },
      { grade: "D7", range: "50 – 59", desc: "Pass" },
      { grade: "F9", range: "0 – 49", desc: "Fail" },
    ],
    terminology: {
      student: 'Student',
      teacher: 'Teacher',
      class: 'Class',
      level_1: 'JHS',
      level_2: 'SHS',
      results: 'Terminal Report'
    },
    schoolLevels: ['Primary', 'JHS', 'SHS', 'University', 'Mixed']
  },
  NG: {
    name: 'Nigeria',
    currency: 'NGN',
    currencySymbol: '₦',
    gradingScale: [
      { grade: "A", range: "75 – 100", desc: "Excellent" },
      { grade: "B", range: "65 – 74", desc: "Very Good" },
      { grade: "C", range: "50 – 64", desc: "Credit" },
      { grade: "P", range: "40 – 49", desc: "Pass" },
      { grade: "F", range: "0 – 39", desc: "Fail" },
    ],
    terminology: {
      student: 'Student',
      teacher: 'Teacher',
      class: 'Class',
      level_1: 'JSS',
      level_2: 'SSS',
      results: 'Exam Result'
    },
    schoolLevels: ['Primary', 'JSS', 'SSS', 'University', 'Mixed']
  },
  UK: {
    name: 'United Kingdom',
    currency: 'GBP',
    currencySymbol: '£',
    gradingScale: [
      { grade: "9", range: "90 – 100", desc: "Exceptional" },
      { grade: "7", range: "80 – 89", desc: "Distinction" },
      { grade: "5", range: "60 – 69", desc: "Merit" },
      { grade: "4", range: "50 – 59", desc: "Pass" },
      { grade: "U", range: "0 – 49", desc: "Unclassified" },
    ],
    terminology: {
      student: 'Pupil',
      teacher: 'Tutor',
      class: 'Year Group',
      level_1: 'Primary',
      level_2: 'Secondary',
      results: 'Attainment Report'
    },
    schoolLevels: ['Primary', 'Secondary', 'Sixth Form', 'University']
  },
  US: {
    name: 'United States',
    currency: 'USD',
    currencySymbol: '$',
    gradingScale: [
      { grade: "A+", range: "97 – 100", desc: "Exceptional" },
      { grade: "A", range: "90 – 96", desc: "Excellent" },
      { grade: "B", range: "80 – 89", desc: "Proficient" },
      { grade: "C", range: "70 – 79", desc: "Basic" },
      { grade: "F", range: "0 – 69", desc: "Failing" },
    ],
    terminology: {
      student: 'Student',
      teacher: 'Instructor',
      class: 'Grade',
      level_1: 'Middle School',
      level_2: 'High School',
      results: 'Report Card'
    },
    schoolLevels: ['Elementary', 'Middle School', 'High School', 'College']
  },
  GLOBAL: {
    name: 'International',
    currency: 'USD',
    currencySymbol: '$',
    gradingScale: [
      { grade: "A+", range: "90 – 100", desc: "Exceptional" },
      { grade: "A", range: "80 – 89", desc: "Excellent" },
      { grade: "B", range: "70 – 79", desc: "Proficient" },
      { grade: "C", range: "60 – 69", desc: "Satisfactory" },
      { grade: "F", range: "0 – 59", desc: "Unsatisfactory" },
    ],
    terminology: {
      student: 'Scholar',
      teacher: 'Faculty',
      class: 'Grade',
      level_1: 'Stage 1',
      level_2: 'Stage 2',
      results: 'Academic Ledger'
    },
    schoolLevels: ['Primary', 'Secondary', 'Tertiary', 'Mixed']
  }
};

export const LocalizationProvider = ({ children }) => {
  const [country, setCountry] = useState('GLOBAL');
  const [config, setConfig] = useState(countryConfigs.GLOBAL);

  const changeCountry = (code) => {
    if (countryConfigs[code]) {
      setCountry(code);
      setConfig(countryConfigs[code]);
      localStorage.setItem('schoolos_country', code);
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem('schoolos_country');
    if (saved && countryConfigs[saved]) {
      setCountry(saved);
      setConfig(countryConfigs[saved]);
    }
  }, []);

  const formatCurrency = (amount) => {
    return `${config.currencySymbol}${amount.toLocaleString()}`;
  };

  return (
    <LocalizationContext.Provider value={{ country, config, changeCountry, formatCurrency }}>
      {children}
    </LocalizationContext.Provider>
  );
};

export const useLocalization = () => {
  const context = useContext(LocalizationContext);
  if (!context) {
    throw new Error('useLocalization must be used within a LocalizationProvider');
  }
  return context;
};
