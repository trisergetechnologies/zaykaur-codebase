import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Alert,
  ActivityIndicator,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useAuthStore } from "../store/authStore";
import { api } from "../lib/api";
import type { ApiAddress } from "../types/api";
import { colors } from "../theme/colors";
import { typography } from "../theme/typography";
import type { AccountStackParamList } from "../navigation/AccountStack";

type Props = NativeStackScreenProps<AccountStackParamList, "Addresses">;

interface AddressItem extends ApiAddress {
  index?: number;
}

export function AddressesScreen({ navigation }: Props) {
  const { loadUser } = useAuthStore();
  const [addresses, setAddresses] = useState<AddressItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAddresses = async () => {
    setLoading(true);
    const res = await api.get<{ items: AddressItem[] }>("/customer/address");
    setLoading(false);
    if (res.success && res.data) {
      const data = res.data as { items?: AddressItem[] };
      const list = Array.isArray(data?.items) ? data.items : [];
      setAddresses(list);
    } else {
      setAddresses([]);
    }
  };

  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    postalCode: "",
    country: "India",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchAddresses();
  }, []);

  const resetForm = () => {
    setFormData({ fullName: "", phone: "", street: "", city: "", state: "", postalCode: "", country: "India" });
  };

  const handleAddAddress = async () => {
    if (!formData.fullName || !formData.phone || !formData.street || !formData.city || !formData.state || !formData.postalCode) {
      Alert.alert("Error", "Please fill all required fields");
      return;
    }
    setSaving(true);
    const res = await api.post("/customer/address", formData);
    setSaving(false);
    if (res.success) {
      setShowAddForm(false);
      resetForm();
      loadUser();
      fetchAddresses();
    } else {
      Alert.alert("Error", res.message || "Failed to add address");
    }
  };

  const setDefault = async (index: number) => {
    const res = await api.patch(`/customer/address/${index}/default`, {});
    if (res.success) {
      loadUser();
      fetchAddresses();
    } else {
      Alert.alert("Error", res.message || "Failed to set default");
    }
  };

  const deleteAddress = (index: number) => {
    Alert.alert("Delete address", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          const res = await api.delete(`/customer/address/${index}`);
          if (res.success) {
            loadUser();
            fetchAddresses();
          } else {
            Alert.alert("Error", res.message || "Failed to delete");
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>
      <View style={styles.titleRow}>
        <Text style={styles.title}>Addresses</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => setShowAddForm(true)}
          accessibilityLabel="Add new address"
          accessibilityRole="button"
        >
          <Text style={styles.addBtnText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={showAddForm} animationType="slide" transparent>
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Address</Text>
            {(["fullName", "phone", "street", "city", "state", "postalCode"] as const).map((field) => (
              <TextInput
                key={field}
                style={styles.input}
                placeholder={field === "fullName" ? "Full Name" : field === "postalCode" ? "Postal Code" : field.charAt(0).toUpperCase() + field.slice(1)}
                value={formData[field]}
                onChangeText={(val) => setFormData((prev) => ({ ...prev, [field]: val }))}
                keyboardType={field === "phone" || field === "postalCode" ? "number-pad" : "default"}
                accessibilityLabel={field}
              />
            ))}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => { setShowAddForm(false); resetForm(); }}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleAddAddress} disabled={saving}>
                {saving ? <ActivityIndicator size="small" color={colors.white} /> : <Text style={styles.saveBtnText}>Save</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {loading && addresses.length === 0 ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scroll}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={fetchAddresses}
              tintColor={colors.primary}
            />
          }
        >
          {addresses.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>No addresses</Text>
              <Text style={styles.emptySub}>Add an address for delivery.</Text>
            </View>
          ) : (
            addresses.map((addr, i) => {
              const idx = (addr as AddressItem).index ?? i;
              return (
                <View key={idx} style={styles.card}>
                  <Text style={styles.name}>{addr.fullName}</Text>
                  {addr.phone ? (
                    <Text style={styles.line}>{addr.phone}</Text>
                  ) : null}
                  <Text style={styles.line}>
                    {[addr.street, addr.city, addr.state, addr.postalCode]
                      .filter(Boolean)
                      .join(", ")}
                  </Text>
                  {addr.isDefault && (
                    <View style={styles.defaultBadge}>
                      <Text style={styles.defaultText}>Default</Text>
                    </View>
                  )}
                  <View style={styles.actions}>
                    {!addr.isDefault && (
                      <TouchableOpacity
                        onPress={() => setDefault(idx)}
                        style={styles.actionBtn}
                      >
                        <Text style={styles.actionText}>Set default</Text>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity
                      onPress={() => deleteAddress(idx)}
                      style={[styles.actionBtn, styles.deleteBtn]}
                    >
                      <Text style={styles.deleteText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  back: { padding: 16, paddingTop: 8 },
  backText: { ...typography.body, color: colors.primary, fontWeight: "600" },
  titleRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginHorizontal: 20, marginBottom: 16 },
  title: { ...typography.h1, color: colors.text },
  addBtn: { backgroundColor: colors.primary, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  addBtnText: { ...typography.bodySmall, color: colors.white, fontWeight: "700" },
  modalOverlay: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.4)" },
  modalContent: { backgroundColor: colors.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, paddingBottom: 40 },
  modalTitle: { ...typography.h3, color: colors.text, marginBottom: 16 },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: 12, marginBottom: 10, ...typography.body, color: colors.text },
  modalActions: { flexDirection: "row", justifyContent: "flex-end", gap: 12, marginTop: 8 },
  cancelBtn: { paddingVertical: 12, paddingHorizontal: 20 },
  cancelText: { ...typography.body, color: colors.textSecondary },
  saveBtn: { backgroundColor: colors.primary, paddingVertical: 12, paddingHorizontal: 24, borderRadius: 10 },
  saveBtnText: { ...typography.body, color: colors.white, fontWeight: "700" },
  scroll: { padding: 20, paddingBottom: 40 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  name: { ...typography.body, fontWeight: "600", color: colors.text },
  line: { ...typography.bodySmall, color: colors.textSecondary, marginTop: 4 },
  defaultBadge: {
    alignSelf: "flex-start",
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 8,
  },
  defaultText: { ...typography.caption, color: colors.primary, fontWeight: "600" },
  actions: { flexDirection: "row", marginTop: 12, gap: 12 },
  actionBtn: { paddingVertical: 6 },
  actionText: { ...typography.bodySmall, color: colors.primary, fontWeight: "600" },
  deleteBtn: {},
  deleteText: { ...typography.bodySmall, color: colors.error },
  loading: { flex: 1, justifyContent: "center", alignItems: "center" },
  empty: { paddingVertical: 48, alignItems: "center" },
  emptyText: { ...typography.h3, color: colors.text, marginBottom: 8 },
  emptySub: { ...typography.bodySmall, color: colors.textMuted },
});
