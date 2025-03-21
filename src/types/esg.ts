
export type ApprovalStatus = 'draft' | 'pending' | 'approved' | 'rejected';

// Add the ESGSubmission type needed by the ApprovalQueue component
export interface ESGSubmission {
  id: string;
  siteName: string;
  period: string;
  submittedBy: string;
  status: ApprovalStatus;
  submittedAt: string;
  approvedAt?: string | null;
  rejectedAt?: string | null;
  reviewer?: string | null;
  reviewComment?: string | null;
  siteId: string;
  data?: Record<string, any> | null;
}

export interface SiteInfo {
  id: string;
  name: string;
  location: string;
  type: string;
}

export interface EnergyConsumption {
  totalElectricity: number; // kWh
  renewableElectricityPPA: number; // kWh
  renewableElectricityRooftop: number; // kWh
  coalConsumption: number; // MT
  hsdConsumption: number; // KL
  furnaceOilConsumption: number; // MT
  petrolConsumption: number; // KL
}

export interface AirEmissions {
  nox: number; // MT
  sox: number; // MT
  particulateMatter: number; // MT
  persistentOrganicPollutants: number; // MT
  volatileOrganicCompounds: number; // MT
  hazardousAirPollutants: number; // MT
}

export interface WaterManagement {
  totalWaterWithdrawal: number; // KL
  thirdPartyWaterUsage: number; // KL
  rainwaterHarvesting: number; // KL
  totalWastewaterGenerated: number; // KL
  recycledWastewater: number; // KL
  waterDischargedToThirdParties: number; // KL
}

export interface WasteManagement {
  hazardousWasteLandfill: number; // MT
  hazardousWasteIncinerated: number; // MT
  hazardousWasteCoProcessed: number; // MT
  totalHazardousWaste: number; // MT
  plasticWaste: number; // MT
  nonHazardousWaste: number; // MT
  bioMedicalWaste: number; // MT
  eWaste: number; // MT
  wasteOil: number; // MT
  totalWasteGenerated: number; // MT
}

export interface EnvironmentalData {
  energyConsumption: EnergyConsumption;
  airEmissions: AirEmissions;
  waterManagement: WaterManagement;
  wasteManagement: WasteManagement;
}

export interface Employment {
  totalEmployees: number;
  maleEmployees: number;
  femaleEmployees: number;
  newHires: number;
  contractWorkersMale: number;
  contractWorkersFemale: number;
  attrition: number;
}

export interface EmployeeBenefits {
  healthInsuranceCoverage: number; // %
  accidentInsuranceCoverage: number; // %
  parentalBenefitsCoverage: number; // %
  providentFundCoverage: number; // %
  gratuityCoverage: number; // %
  esiCoverage: number; // %
}

export interface WagesCompensation {
  medianMaleSalary: number; // INR/year
  medianFemaleSalary: number; // INR/year
  femaleWagesPercentage: number; // %
}

export interface TrainingDevelopment {
  careerReviewPercentage: number; // %
  gmpTrainingHours: number; // Man-Hours
  ehsTrainingHours: number; // Man-Hours
  otherTrainingHours: number; // Man-Hours
}

export interface WorkplaceSafety {
  reportableIncidentsEmployees: number;
  reportableIncidentsWorkers: number;
  recordableInjuriesEmployees: number;
  recordableInjuriesWorkers: number;
  fatalitiesEmployees: number;
  fatalitiesWorkers: number;
  manHoursEmployees: number; // Man-Hours
  manHoursWorkers: number; // Man-Hours
}

export interface ComplaintsGrievances {
  workplaceComplaints: number;
  consumerComplaints: number;
}

export interface SocialData {
  employment: Employment;
  employeeBenefits: EmployeeBenefits;
  wagesCompensation: WagesCompensation;
  trainingDevelopment: TrainingDevelopment;
  workplaceSafety: WorkplaceSafety;
  complaintsGrievances: ComplaintsGrievances;
}

export interface BoardComposition {
  totalBoardMembers: number;
  womenPercentage: number; // %
  ageGroupPercentages: {
    under30: number; // %
    between30And50: number; // %
    above50: number; // %
  };
  experienceLevelPercentages: {
    under5Years: number; // %
    between5And10Years: number; // %
    above10Years: number; // %
  };
}

export interface CybersecurityData {
  incidentsCount: number;
}

export interface BusinessEthics {
  corruptionIncidents: number;
  legalFines: number;
}

export interface GovernanceData {
  boardComposition: BoardComposition;
  cybersecurity: CybersecurityData;
  businessEthics: BusinessEthics;
}

export interface ESGFormData {
  id: string;
  siteId: string;
  reportingPeriod: {
    startDate: string;
    endDate: string;
  };
  submittedBy: {
    id: string;
    name: string;
    email: string;
    department: string;
  };
  status: ApprovalStatus;
  createdAt: string;
  updatedAt: string;
  approvedBy?: {
    id: string;
    name: string;
    email: string;
  };
  approvedAt?: string;
  rejectionReason?: string;
  environmental: EnvironmentalData;
  social: SocialData;
  governance: GovernanceData;
}

// Mock data for demonstration purposes
export const mockSites: SiteInfo[] = [
  { id: "1", name: "Unit-I Bonthapally", location: "Bonthapally", type: "Production" },
  { id: "2", name: "Unit-II Jeedimetla", location: "Jeedimetla", type: "Production" },
  { id: "3", name: "Unit-III Bonthapally", location: "Bonthapally", type: "Production" },
  { id: "4", name: "Unit-IV Vizag", location: "Vizag", type: "Production" },
  { id: "5", name: "Unit-V Vizag", location: "Vizag", type: "Production" },
  { id: "6", name: "Gagillapur FD", location: "Gagillapur", type: "Formulation Development" },
  { id: "7", name: "Corporate Office", location: "Hyderabad", type: "Administrative" },
  { id: "8", name: "R&D Units", location: "Multiple", type: "Research" },
  { id: "9", name: "Granules CZRO", location: "Czech Republic", type: "Subsidiary" },
  { id: "10", name: "Granules USA", location: "USA", type: "Subsidiary" },
  { id: "11", name: "Granules Pharmaceuticals Inc.", location: "USA", type: "Subsidiary" },
  { id: "12", name: "Granules Lifesciences", location: "India", type: "Subsidiary" },
];

export const mockESGData: ESGFormData[] = [
  {
    id: "1",
    siteId: "1",
    reportingPeriod: {
      startDate: "2023-01-01",
      endDate: "2023-03-31"
    },
    submittedBy: {
      id: "101",
      name: "John Doe",
      email: "john.doe@example.com",
      department: "EHS"
    },
    status: "approved",
    createdAt: "2023-04-10T10:30:00Z",
    updatedAt: "2023-04-15T14:20:00Z",
    approvedBy: {
      id: "201",
      name: "Jane Smith",
      email: "jane.smith@example.com"
    },
    approvedAt: "2023-04-15T14:20:00Z",
    environmental: {
      energyConsumption: {
        totalElectricity: 150000,
        renewableElectricityPPA: 50000,
        renewableElectricityRooftop: 10000,
        coalConsumption: 200,
        hsdConsumption: 5000,
        furnaceOilConsumption: 3000,
        petrolConsumption: 1000
      },
      airEmissions: {
        nox: 50,
        sox: 30,
        particulateMatter: 20,
        persistentOrganicPollutants: 5,
        volatileOrganicCompounds: 15,
        hazardousAirPollutants: 10
      },
      waterManagement: {
        totalWaterWithdrawal: 50000,
        thirdPartyWaterUsage: 20000,
        rainwaterHarvesting: 5000,
        totalWastewaterGenerated: 30000,
        recycledWastewater: 15000,
        waterDischargedToThirdParties: 10000
      },
      wasteManagement: {
        hazardousWasteLandfill: 100,
        hazardousWasteIncinerated: 50,
        hazardousWasteCoProcessed: 30,
        totalHazardousWaste: 180,
        plasticWaste: 200,
        nonHazardousWaste: 500,
        bioMedicalWaste: 20,
        eWaste: 15,
        wasteOil: 25,
        totalWasteGenerated: 940
      }
    },
    social: {
      employment: {
        totalEmployees: 500,
        maleEmployees: 350,
        femaleEmployees: 150,
        newHires: 50,
        contractWorkersMale: 100,
        contractWorkersFemale: 50,
        attrition: 30
      },
      employeeBenefits: {
        healthInsuranceCoverage: 100,
        accidentInsuranceCoverage: 100,
        parentalBenefitsCoverage: 100,
        providentFundCoverage: 100,
        gratuityCoverage: 100,
        esiCoverage: 40
      },
      wagesCompensation: {
        medianMaleSalary: 800000,
        medianFemaleSalary: 800000,
        femaleWagesPercentage: 30
      },
      trainingDevelopment: {
        careerReviewPercentage: 90,
        gmpTrainingHours: 2000,
        ehsTrainingHours: 1500,
        otherTrainingHours: 5000
      },
      workplaceSafety: {
        reportableIncidentsEmployees: 2,
        reportableIncidentsWorkers: 3,
        recordableInjuriesEmployees: 1,
        recordableInjuriesWorkers: 2,
        fatalitiesEmployees: 0,
        fatalitiesWorkers: 0,
        manHoursEmployees: 1000000,
        manHoursWorkers: 500000
      },
      complaintsGrievances: {
        workplaceComplaints: 5,
        consumerComplaints: 2
      }
    },
    governance: {
      boardComposition: {
        totalBoardMembers: 10,
        womenPercentage: 30,
        ageGroupPercentages: {
          under30: 0,
          between30And50: 40,
          above50: 60
        },
        experienceLevelPercentages: {
          under5Years: 10,
          between5And10Years: 30,
          above10Years: 60
        }
      },
      cybersecurity: {
        incidentsCount: 1
      },
      businessEthics: {
        corruptionIncidents: 0,
        legalFines: 0
      }
    }
  },
  {
    id: "2",
    siteId: "2",
    reportingPeriod: {
      startDate: "2023-01-01",
      endDate: "2023-03-31"
    },
    submittedBy: {
      id: "102",
      name: "Robert Johnson",
      email: "robert.johnson@example.com",
      department: "Operations"
    },
    status: "pending",
    createdAt: "2023-04-12T09:15:00Z",
    updatedAt: "2023-04-12T09:15:00Z",
    environmental: {
      energyConsumption: {
        totalElectricity: 130000,
        renewableElectricityPPA: 40000,
        renewableElectricityRooftop: 8000,
        coalConsumption: 180,
        hsdConsumption: 4500,
        furnaceOilConsumption: 2800,
        petrolConsumption: 900
      },
      airEmissions: {
        nox: 45,
        sox: 28,
        particulateMatter: 18,
        persistentOrganicPollutants: 4,
        volatileOrganicCompounds: 14,
        hazardousAirPollutants: 9
      },
      waterManagement: {
        totalWaterWithdrawal: 48000,
        thirdPartyWaterUsage: 18000,
        rainwaterHarvesting: 4000,
        totalWastewaterGenerated: 28000,
        recycledWastewater: 14000,
        waterDischargedToThirdParties: 9000
      },
      wasteManagement: {
        hazardousWasteLandfill: 90,
        hazardousWasteIncinerated: 45,
        hazardousWasteCoProcessed: 25,
        totalHazardousWaste: 160,
        plasticWaste: 180,
        nonHazardousWaste: 450,
        bioMedicalWaste: 18,
        eWaste: 14,
        wasteOil: 22,
        totalWasteGenerated: 844
      }
    },
    social: {
      employment: {
        totalEmployees: 450,
        maleEmployees: 300,
        femaleEmployees: 150,
        newHires: 40,
        contractWorkersMale: 90,
        contractWorkersFemale: 45,
        attrition: 25
      },
      employeeBenefits: {
        healthInsuranceCoverage: 100,
        accidentInsuranceCoverage: 100,
        parentalBenefitsCoverage: 100,
        providentFundCoverage: 100,
        gratuityCoverage: 100,
        esiCoverage: 35
      },
      wagesCompensation: {
        medianMaleSalary: 750000,
        medianFemaleSalary: 750000,
        femaleWagesPercentage: 33
      },
      trainingDevelopment: {
        careerReviewPercentage: 85,
        gmpTrainingHours: 1800,
        ehsTrainingHours: 1350,
        otherTrainingHours: 4500
      },
      workplaceSafety: {
        reportableIncidentsEmployees: 1,
        reportableIncidentsWorkers: 2,
        recordableInjuriesEmployees: 0,
        recordableInjuriesWorkers: 1,
        fatalitiesEmployees: 0,
        fatalitiesWorkers: 0,
        manHoursEmployees: 900000,
        manHoursWorkers: 450000
      },
      complaintsGrievances: {
        workplaceComplaints: 4,
        consumerComplaints: 1
      }
    },
    governance: {
      boardComposition: {
        totalBoardMembers: 10,
        womenPercentage: 30,
        ageGroupPercentages: {
          under30: 0,
          between30And50: 40,
          above50: 60
        },
        experienceLevelPercentages: {
          under5Years: 10,
          between5And10Years: 30,
          above10Years: 60
        }
      },
      cybersecurity: {
        incidentsCount: 0
      },
      businessEthics: {
        corruptionIncidents: 0,
        legalFines: 0
      }
    }
  },
  {
    id: "3",
    siteId: "3",
    reportingPeriod: {
      startDate: "2023-01-01", 
      endDate: "2023-03-31"
    },
    submittedBy: {
      id: "103",
      name: "Sarah Williams",
      email: "sarah.williams@example.com", 
      department: "Sustainability"
    },
    status: "rejected",
    createdAt: "2023-04-08T14:45:00Z",
    updatedAt: "2023-04-14T11:30:00Z",
    approvedBy: {
      id: "202",
      name: "Michael Brown",
      email: "michael.brown@example.com"
    },
    approvedAt: "2023-04-14T11:30:00Z",
    rejectionReason: "Data inconsistencies in water management section. Please review and resubmit.",
    environmental: {
      energyConsumption: {
        totalElectricity: 160000,
        renewableElectricityPPA: 55000,
        renewableElectricityRooftop: 12000,
        coalConsumption: 220,
        hsdConsumption: 5500,
        furnaceOilConsumption: 3200,
        petrolConsumption: 1100
      },
      airEmissions: {
        nox: 55,
        sox: 32,
        particulateMatter: 22,
        persistentOrganicPollutants: 6,
        volatileOrganicCompounds: 16,
        hazardousAirPollutants: 11
      },
      waterManagement: {
        totalWaterWithdrawal: 55000,
        thirdPartyWaterUsage: 22000,
        rainwaterHarvesting: 5500,
        totalWastewaterGenerated: 33000,
        recycledWastewater: 16500,
        waterDischargedToThirdParties: 11000
      },
      wasteManagement: {
        hazardousWasteLandfill: 110,
        hazardousWasteIncinerated: 55,
        hazardousWasteCoProcessed: 35,
        totalHazardousWaste: 200,
        plasticWaste: 220,
        nonHazardousWaste: 550,
        bioMedicalWaste: 22,
        eWaste: 17,
        wasteOil: 28,
        totalWasteGenerated: 1037
      }
    },
    social: {
      employment: {
        totalEmployees: 550,
        maleEmployees: 380,
        femaleEmployees: 170,
        newHires: 55,
        contractWorkersMale: 110,
        contractWorkersFemale: 55,
        attrition: 33
      },
      employeeBenefits: {
        healthInsuranceCoverage: 100,
        accidentInsuranceCoverage: 100,
        parentalBenefitsCoverage: 100,
        providentFundCoverage: 100,
        gratuityCoverage: 100,
        esiCoverage: 44
      },
      wagesCompensation: {
        medianMaleSalary: 820000,
        medianFemaleSalary: 820000,
        femaleWagesPercentage: 31
      },
      trainingDevelopment: {
        careerReviewPercentage: 95,
        gmpTrainingHours: 2200,
        ehsTrainingHours: 1650,
        otherTrainingHours: 5500
      },
      workplaceSafety: {
        reportableIncidentsEmployees: 3,
        reportableIncidentsWorkers: 4,
        recordableInjuriesEmployees: 2,
        recordableInjuriesWorkers: 3,
        fatalitiesEmployees: 0,
        fatalitiesWorkers: 0,
        manHoursEmployees: 1100000,
        manHoursWorkers: 550000
      },
      complaintsGrievances: {
        workplaceComplaints: 6,
        consumerComplaints: 3
      }
    },
    governance: {
      boardComposition: {
        totalBoardMembers: 10,
        womenPercentage: 30,
        ageGroupPercentages: {
          under30: 0,
          between30And50: 40,
          above50: 60
        },
        experienceLevelPercentages: {
          under5Years: 10,
          between5And10Years: 30,
          above10Years: 60
        }
      },
      cybersecurity: {
        incidentsCount: 2
      },
      businessEthics: {
        corruptionIncidents: 0,
        legalFines: 1
      }
    }
  }
];
