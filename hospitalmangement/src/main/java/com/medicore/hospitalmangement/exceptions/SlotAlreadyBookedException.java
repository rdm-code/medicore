package com.medicore.hospitalmangement.exceptions;

public class SlotAlreadyBookedException extends RuntimeException {
  public SlotAlreadyBookedException(String message) { super(message); }
}