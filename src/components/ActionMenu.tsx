import React, { useRef, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/darkColors';

type Action = {
  label: string;
  onPress: () => void;
  destructive?: boolean;
};

type ActionMenuProps = {
  actions: Action[];
  isOpen?: boolean;
  onClose?: () => void;
  onToggle?: () => void;
  onSelect?: (action: Action) => void;
};

export function ActionMenu({ actions, isOpen, onClose, onToggle, onSelect }: ActionMenuProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0, width: 0 });
  const buttonRef = useRef<View>(null);
  const controlled = typeof isOpen === 'boolean';
  const open = controlled ? isOpen : internalOpen;

  const handleToggle = () => {
    if (controlled) {
      onToggle?.();
    } else {
      setInternalOpen((current) => !current);
    }
  };

  const handleSelect = (action: Action) => {
    onSelect?.(action);
    action.onPress();
    if (controlled) {
      onClose?.();
    } else {
      setInternalOpen(false);
    }
  };

  const measureButton = () => {
    buttonRef.current?.measureInWindow((x, y, width, height) => {
      setMenuPosition({ x, y: y + height, width });
    });
  };

  return (
    <View>
      <Pressable
        ref={buttonRef}
        onPress={() => {
          measureButton();
          handleToggle();
        }}
        style={styles.menuButton}
      >
        <Text style={styles.menuIcon}>⋯</Text>
      </Pressable>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onShow={measureButton}
        onRequestClose={() => {
          if (controlled) {
            onClose?.();
          } else {
            setInternalOpen(false);
          }
        }}
      >
        <Pressable
          style={styles.backdrop}
          onPress={() => {
            if (controlled) {
              onClose?.();
            } else {
              setInternalOpen(false);
            }
          }}
        >
          <View
            style={[
              styles.dropdown,
              {
                position: 'absolute',
                top: menuPosition.y,
                right: 16,
              },
            ]}
          >
            {actions.map((action, index) => (
              <Pressable
                key={index}
                onPress={() => handleSelect(action)}
                style={({ pressed }) => [styles.dropdownItem, pressed && styles.dropdownItemPressed]}
              >
                <Text style={[styles.dropdownLabel, action.destructive && styles.destructive]}>
                  {action.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  menuButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  menuIcon: {
    color: colors.textMuted,
    fontSize: 18,
    fontWeight: '700',
  },
  backdrop: {
    flex: 1,
  },
  dropdown: {
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderCard,
    paddingVertical: 8,
    minWidth: 150,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 24,
  },
  dropdownItem: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  dropdownItemPressed: {
    backgroundColor: colors.cardPressed,
  },
  dropdownLabel: {
    color: colors.textBody,
    fontSize: 14,
    fontWeight: '600',
  },
  destructive: {
    color: colors.error,
  },
});
