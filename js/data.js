/* SPDX-License-Identifier: MIT
 * Copyright(c) 2024 Darek Stojaczyk
 */

// Storage for PG JSONs and more

'use strict';

const PG_DATA = {};

let STORAGE_ORDER_IDX = 1;
PG_DATA.storage_order = {
    "Inventory": STORAGE_ORDER_IDX++,
    "Saddlebag": STORAGE_ORDER_IDX++,
    "CouncilVault": STORAGE_ORDER_IDX++,
    // Serbule
    "NPC_Joe": STORAGE_ORDER_IDX++,
    "NPC_Marna": STORAGE_ORDER_IDX++,
    "IvynsChest": STORAGE_ORDER_IDX++,
    "NPC_Tadion": STORAGE_ORDER_IDX++,
    "NPC_CharlesThompson": STORAGE_ORDER_IDX++,
    "SerbuleCommunityChest": STORAGE_ORDER_IDX++,
    "*AccountStorage_Serbule": STORAGE_ORDER_IDX++,
    // Crystal Cavern
    "DalvosChest": STORAGE_ORDER_IDX++,
    // Casino
    "NPC_WillemFangblade": STORAGE_ORDER_IDX++,
    "NPC_Mandibles": STORAGE_ORDER_IDX++,
    "NPC_Kib": STORAGE_ORDER_IDX++,
    "NPC_Tavilak": STORAGE_ORDER_IDX++,
    "NPC_Ragabir": STORAGE_ORDER_IDX++,
    "NPC_Otis": STORAGE_ORDER_IDX++,
    "NPC_Qatik": STORAGE_ORDER_IDX++,
    "*AccountStorage_Casino": STORAGE_ORDER_IDX++,
    // Rahu
    "NPC_Nishika": STORAGE_ORDER_IDX++,
    "NPC_Ashk": STORAGE_ORDER_IDX++,
    "NPC_Ichin": STORAGE_ORDER_IDX++,
    "NPC_DanielMurderdark": STORAGE_ORDER_IDX++,
    "*AccountStorage_Rahu": STORAGE_ORDER_IDX++,
    // Serbule Hills
    "NPC_JuliusPatton": STORAGE_ORDER_IDX++,
    "NPC_TylerGreen": STORAGE_ORDER_IDX++,
    "TapestryInnChest": STORAGE_ORDER_IDX++,
    "NPC_MarithFelgard": STORAGE_ORDER_IDX++,
    "NPC_SammieGrimspine": STORAGE_ORDER_IDX++,
    // Small Box of Space
    "BoxOfSpace": STORAGE_ORDER_IDX++,
    // Fae Pocket Dimension
    "StoragePortal": STORAGE_ORDER_IDX++,
    // Player-Made Storage Crate
    "StorageCrate": STORAGE_ORDER_IDX++,
    // Eltibule
    "NPC_SieAntry": STORAGE_ORDER_IDX++,
    // Sun Vale
    "NPC_Silvia": STORAGE_ORDER_IDX++,
    "NPC_Agrashab": STORAGE_ORDER_IDX++,
    "NPC_Jumper": STORAGE_ORDER_IDX++,
    "NPC_Raul": STORAGE_ORDER_IDX++,
    "NPC_Norbert": STORAGE_ORDER_IDX++,
    "NPC_Urglemarg": STORAGE_ORDER_IDX++,
    "*AccountStorage_AnimalTown": STORAGE_ORDER_IDX++,
    // Kur Mountains
    "WardenStorageChest": STORAGE_ORDER_IDX++,
    "RiShinStorageChest": STORAGE_ORDER_IDX++,
    "NPC_Gurki": STORAGE_ORDER_IDX++,
    "NPC_JaceSoral": STORAGE_ORDER_IDX++,
    "NPC_Lamashu": STORAGE_ORDER_IDX++,
    "NPC_Ukorga": STORAGE_ORDER_IDX++,
    "NPC_LauraNeth": STORAGE_ORDER_IDX++,
    "NPC_Red": STORAGE_ORDER_IDX++,
    // Altar of Norala (Werewolf only)
    "WerewolfAltar": STORAGE_ORDER_IDX++,
    // Ilmari
    "NPC_Selaxi": STORAGE_ORDER_IDX++,
    // Fae Realm
    "NPC_Bendith": STORAGE_ORDER_IDX++,
    "NPC_Raina": STORAGE_ORDER_IDX++,
    "NPC_MidgeTheApothecary": STORAGE_ORDER_IDX++,
    "NPC_NoitaTheGreen": STORAGE_ORDER_IDX++,
    // Povus
    "PovusStorageChest": STORAGE_ORDER_IDX++,
    "NPC_Mope": STORAGE_ORDER_IDX++,
    // New Prestonbule
    "NPC_Sona": STORAGE_ORDER_IDX++,
    "NPC_Torgan": STORAGE_ORDER_IDX++,
    // Gazluk Keep
    "NPC_Melandria": STORAGE_ORDER_IDX++,
    // Winter Nexus
    "WinterCourtEntranceChest": STORAGE_ORDER_IDX++,
    // Anagoge
    "NPC_Lawara": STORAGE_ORDER_IDX++,
    "TutorialChest": STORAGE_ORDER_IDX++,
    // Serbule Crypt
    "NPC_SirArif": STORAGE_ORDER_IDX++,
    "KhyrulekMementoChest": STORAGE_ORDER_IDX++,
};
