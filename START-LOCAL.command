#!/bin/bash
cd "$(dirname "$0")" || exit 1
./INSTALL-FONTS.command
(sleep 1.5; open "http://localhost:4173") &
npm run dev
