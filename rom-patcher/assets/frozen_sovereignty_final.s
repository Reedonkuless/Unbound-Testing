.syntax unified
.thumb
.text
.global frozen_sovereignty_wrapper
.thumb_func
frozen_sovereignty_wrapper:
    push {r0, r1, r2, r7, lr}

    @ Offensive: active effect 100, species 1298..1301, damaging Ice => x1.10
    ldrb r0, [r4, #0x14]
    cmp  r0, #100
    bne  check_defender
    ldrh r0, [r4, #0x0c]
    ldr  r1, =1298
    cmp  r0, r1
    blo  check_defender
    adds r1, #3
    cmp  r0, r1
    bhi  check_defender
    movs r0, r4
    adds r0, #0x4f
    ldrb r0, [r0]
    cmp  r0, #2
    beq  check_defender
    movs r0, r4
    adds r0, #0x4e
    ldrb r0, [r0]
    cmp  r0, #0x0f
    bne  check_defender
    movs r0, r5
    movs r2, #11
    muls r0, r2
    movs r1, #10
    bl   call_udiv
    movs r5, r0

check_defender:
    @ Defensive: active effect 100, species 1298..1301, damaging resolved SE => x0.80
    ldrb r0, [r4, #0x16]
    cmp  r0, #100
    bne  replay
    ldrh r0, [r4, #0x0e]
    ldr  r1, =1298
    cmp  r0, r1
    blo  replay
    adds r1, #3
    cmp  r0, r1
    bhi  replay
    movs r0, r4
    adds r0, #0x4f
    ldrb r0, [r0]
    cmp  r0, #2
    beq  replay
    movs r0, r4
    adds r0, #0x50
    ldrb r0, [r0]
    movs r1, #2
    tst  r0, r1
    beq  replay
    movs r0, r5
    lsls r0, r0, #2
    movs r1, #5
    bl   call_udiv
    movs r5, r0

replay:
    @ Replay native instructions replaced at 0x089D249E.
    movs r6, r4
    ldrb r3, [r4, #0x11]
    pop  {r0, r1, r2, r7, pc}

call_udiv:
    ldr r3, =0x08964B0F
    bx  r3

.size frozen_sovereignty_wrapper, .-frozen_sovereignty_wrapper
