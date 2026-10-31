package com.medicore.hospitalmanagement.exceptions;

public class SlotAlreadyBookedException extends RuntimeException {
  public SlotAlreadyBookedException(String message) { super(message); }
}