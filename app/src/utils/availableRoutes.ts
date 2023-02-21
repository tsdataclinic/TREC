export type RouteRecord = {
  city: string;
  route_types: Array<{
    route_type: string;
    routes_serviced: Array<string>
  }>
}

export const AVAILABLE_ROUTES : Array<Record<string, RouteRecord>> = [
    {
      "Hampton Roads": { 
        "city": "Hampton Roads",
        "route_types": [
          {
            "route_type": "Bus",
            "routes_serviced": [
              "001",
              "002",
              "003",
              "004",
              "005",
              "006",
              "008",
              "009",
              "011",
              "012",
              "013",
              "014",
              "015",
              "018",
              "020",
              "021",
              "022",
              "023",
              "024",
              "025",
              "026",
              "027",
              "029",
              "030",
              "031",
              "033",
              "034",
              "035",
              "036",
              "041",
              "043",
              "044",
              "045",
              "047",
              "050",
              "057",
              "058",
              "064",
              "101",
              "102",
              "103",
              "104",
              "105",
              "106",
              "107",
              "108",
              "109",
              "110_merged_9800020",
              "110_merged_9800022",
              "111_merged_9800021",
              "111_merged_9800023",
              "112",
              "114",
              "115",
              "117",
              "118",
              "120",
              "121",
              "15218",
              "15221",
              "15222",
              "15223",
              "15224",
              "15225",
              "15227",
              "15228",
              "15229",
              "17382",
              "403",
              "405",
              "414",
              "415",
              "430",
              "74823",
              "74824",
              "74825",
              "960",
              "961",
              "966",
              "967",
              "972",
              "980"
            ]
          },
          {
            "route_type": "Ferry",
            "routes_serviced": [
              "090"
            ]
          }
        ]
      }
    },
    {
      "NYC": {
        "city": "NYC",
        "route_types": [
          {
            "route_type": "Bus",
            "routes_serviced": [
              "B1",
              "B100",
              "B103",
              "B11",
              "B12",
              "B13",
              "B14",
              "B15",
              "B16",
              "B17",
              "B2",
              "B20",
              "B24",
              "B25",
              "B26",
              "B3",
              "B31",
              "B32",
              "B35",
              "B36",
              "B37",
              "B38",
              "B39",
              "B4",
              "B41",
              "B42",
              "B43",
              "B44",
              "B44+",
              "B45",
              "B46",
              "B46+",
              "B47",
              "B48",
              "B49",
              "B52",
              "B54",
              "B57",
              "B6",
              "B60",
              "B61",
              "B62",
              "B63",
              "B64",
              "B65",
              "B67",
              "B68",
              "B69",
              "B7",
              "B70",
              "B74",
              "B8",
              "B82",
              "B82+",
              "B83",
              "B84",
              "B9",
              "BM1",
              "BM2",
              "BM3",
              "BM4",
              "BM5",
              "BX1",
              "BX10",
              "BX11",
              "BX12",
              "BX12+",
              "BX13",
              "BX15",
              "BX16",
              "BX17",
              "BX18",
              "BX19",
              "BX2",
              "BX20",
              "BX21",
              "BX22",
              "BX23",
              "BX24",
              "BX25",
              "BX26",
              "BX27",
              "BX28",
              "BX29",
              "BX3",
              "BX30",
              "BX31",
              "BX32",
              "BX33",
              "BX34",
              "BX35",
              "BX36",
              "BX38",
              "BX39",
              "BX4",
              "BX40",
              "BX41",
              "BX41+",
              "BX42",
              "BX46",
              "BX4A",
              "BX5",
              "BX6",
              "BX6+",
              "BX7",
              "BX8",
              "BX9",
              "BXM1",
              "BXM10",
              "BXM11",
              "BXM18",
              "BXM2",
              "BXM3",
              "BXM4",
              "BXM6",
              "BXM7",
              "BXM8",
              "BXM9",
              "M1",
              "M10",
              "M100",
              "M101",
              "M102",
              "M103",
              "M104",
              "M106",
              "M11",
              "M116",
              "M12",
              "M125",
              "M14A+",
              "M14D+",
              "M15",
              "M15+",
              "M2",
              "M20",
              "M21",
              "M22",
              "M23+",
              "M3",
              "M31",
              "M34+",
              "M34A+",
              "M35",
              "M4",
              "M42",
              "M5",
              "M50",
              "M55",
              "M57",
              "M60+",
              "M66",
              "M7",
              "M72",
              "M79+",
              "M8",
              "M86+",
              "M9",
              "M96",
              "M98",
              "Q06",
              "Q07",
              "Q08",
              "Q09",
              "Q1",
              "Q10",
              "Q100",
              "Q101",
              "Q102",
              "Q103",
              "Q104",
              "Q11",
              "Q110",
              "Q111",
              "Q112",
              "Q113",
              "Q114",
              "Q12",
              "Q13",
              "Q15",
              "Q15A",
              "Q16",
              "Q17",
              "Q18",
              "Q19",
              "Q2",
              "Q20A",
              "Q20B",
              "Q21",
              "Q22",
              "Q23",
              "Q24",
              "Q25",
              "Q26",
              "Q27",
              "Q28",
              "Q29",
              "Q3",
              "Q30",
              "Q31",
              "Q32",
              "Q33",
              "Q34",
              "Q35",
              "Q36",
              "Q37",
              "Q38",
              "Q39",
              "Q4",
              "Q40",
              "Q41",
              "Q42",
              "Q43",
              "Q44+",
              "Q46",
              "Q47",
              "Q48",
              "Q49",
              "Q5",
              "Q50",
              "Q52+",
              "Q53+",
              "Q54",
              "Q55",
              "Q56",
              "Q58",
              "Q59",
              "Q60",
              "Q64",
              "Q65",
              "Q66",
              "Q67",
              "Q69",
              "Q70+",
              "Q72",
              "Q76",
              "Q77",
              "Q83",
              "Q84",
              "Q85",
              "Q88",
              "QM1",
              "QM10",
              "QM11",
              "QM12",
              "QM15",
              "QM16",
              "QM17",
              "QM18",
              "QM2",
              "QM20",
              "QM21",
              "QM24",
              "QM25",
              "QM3",
              "QM31",
              "QM32",
              "QM34",
              "QM35",
              "QM36",
              "QM4",
              "QM40",
              "QM42",
              "QM44",
              "QM5",
              "QM6",
              "QM7",
              "QM8",
              "S40",
              "S42",
              "S44",
              "S46",
              "S48",
              "S51",
              "S52",
              "S53",
              "S54",
              "S55",
              "S56",
              "S57",
              "S59",
              "S61",
              "S62",
              "S66",
              "S74",
              "S76",
              "S78",
              "S79+",
              "S81",
              "S84",
              "S86",
              "S89",
              "S90",
              "S91",
              "S92",
              "S93",
              "S94",
              "S96",
              "S98",
              "SIM1",
              "SIM10",
              "SIM11",
              "SIM15",
              "SIM1C",
              "SIM2",
              "SIM22",
              "SIM23",
              "SIM24",
              "SIM25",
              "SIM26",
              "SIM3",
              "SIM30",
              "SIM31",
              "SIM32",
              "SIM33",
              "SIM33C",
              "SIM34",
              "SIM35",
              "SIM3C",
              "SIM4",
              "SIM4C",
              "SIM4X",
              "SIM5",
              "SIM6",
              "SIM7",
              "SIM8",
              "SIM8X",
              "SIM9",
              "X27",
              "X28",
              "X37",
              "X38",
              "X63",
              "X64",
              "X68"
            ]
          },
          {
            "route_type": "Rail",
            "routes_serviced": [
              "SI"
            ]
          },
          {
            "route_type": "Subway",
            "routes_serviced": [
              "1",
              "2",
              "3",
              "4",
              "5",
              "6",
              "6X",
              "7",
              "7X",
              "A",
              "B",
              "C",
              "D",
              "E",
              "F",
              "FS",
              "FX",
              "G",
              "GS",
              "H",
              "J",
              "L",
              "M",
              "N",
              "Q",
              "R",
              "W",
              "Z"
            ]
          }
        ]
      }
    }
  ]