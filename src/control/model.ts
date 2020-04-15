interface ChainInit {
  board_infos: [
    {
      board_type: string;
      firmware_id: string;
      board_idx: number;
    }
  ];
  chain_id: string;
  msg_type: string;
}

interface ControlEvent {
  chain_id: string;
  board_type: string;
  board_idx: number;
  com: string;
  idx: number;
  cmd: string;
  val: number;
  msg_type: string;
}
