<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { letterStore, letters, activeLetters, sealedLetters, ceremonyStore } from '$lib/stores/letterStore.js';
	import type { Letter } from '$lib/types.js';
	import { ArrowLeft, Eye, Edit, Feather, Waves, Calendar, User } from 'lucide-svelte';
	import FarewellCeremony from '$lib/components/FarewellCeremony.svelte';

	let selectedTab: 'active' | 'sealed' = 'active';
	let selectedLetter: Letter | null = null;
	let showCeremonyModal = false;
	let ceremonyType: 'dove' | 'sea' | null = null;
	let ceremonyMessage = '';
	let isPerformingCeremony = false;
	let showCeremonyAnimation = false;

	onMount(async () => {
		await letterStore.loadLetters();
	});

	function formatDate(date: Date): string {
		return date.toLocaleDateString('zh-CN', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	}

	function truncateContent(content: string, maxLength: number = 100): string {
		if (content.length <= maxLength) return content;
		return content.substring(0, maxLength) + '...';
	}

	function viewLetter(letter: Letter) {
		goto(`/letters/${letter.id}`);
	}

	function editLetter(letter: Letter) {
		goto(`/write/${letter.id}`);
	}

	function openCeremonyModal(letter: Letter, type: 'dove' | 'sea') {
		selectedLetter = letter;
		ceremonyType = type;
		ceremonyMessage = '';
		showCeremonyModal = true;
	}

	function closeCeremonyModal() {
		selectedLetter = null;
		ceremonyType = null;
		ceremonyMessage = '';
		showCeremonyModal = false;
	}

	async function performCeremony() {
		if (!selectedLetter || !ceremonyType) return;

		const confirmMessage = ceremonyType === 'dove'
			? '确定要放飞白鸽吗？信笺将被封存，无法再编辑。'
			: '确定要沉入深海吗？信笺将被彻底删除，无法恢复。';

		if (!confirm(confirmMessage)) return;

		// 关闭模态框，显示动画
		showCeremonyModal = false;
		showCeremonyAnimation = true;

		isPerformingCeremony = true;
		try {
			await ceremonyStore.performCeremony({
				type: ceremonyType,
				letterId: selectedLetter.id,
				message: ceremonyMessage || undefined
			});
		} catch (error) {
			alert('仪式执行失败，请重试');
			showCeremonyAnimation = false;
		} finally {
			isPerformingCeremony = false;
		}
	}

	function handleCeremonyComplete() {
		// 动画完成后的处理
		showCeremonyAnimation = false;
		selectedLetter = null;
		ceremonyType = null;
		ceremonyMessage = '';
	}

	function handleCeremonyClose() {
		showCeremonyAnimation = false;
		selectedLetter = null;
		ceremonyType = null;
		ceremonyMessage = '';
	}

	function goBack() {
		goto('/');
	}
</script>

<svelte:head>
	<title>信笺管理 - 白鸽与乌鸦</title>
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-dove-50 via-white to-crow-100">
	<!-- 顶部导航 -->
	<header class="bg-white/80 backdrop-blur-sm border-b border-dove-200">
		<div class="container mx-auto px-6 py-4">
			<div class="flex items-center justify-between">
				<button 
					onclick={goBack}
					class="flex items-center text-crow-600 hover:text-crow-800 transition-colors"
				>
					<ArrowLeft class="w-5 h-5 mr-2" />
					返回主页
				</button>

				<h1 class="text-2xl font-serif text-crow-800">信笺管理</h1>

				<a href="/write" class="dove-button">
					写新信笺
				</a>
			</div>
		</div>
	</header>

	<!-- 标签页 -->
	<div class="container mx-auto px-6 py-6">
		<div class="flex space-x-1 bg-white/50 rounded-lg p-1 max-w-md mx-auto mb-8">
			<button 
				onclick={() => selectedTab = 'active'}
				class="flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors {selectedTab === 'active' ? 'bg-white text-crow-800 shadow-sm' : 'text-crow-600 hover:text-crow-800'}"
			>
				活跃信笺 ({$activeLetters.length})
			</button>
			<button 
				onclick={() => selectedTab = 'sealed'}
				class="flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors {selectedTab === 'sealed' ? 'bg-white text-crow-800 shadow-sm' : 'text-crow-600 hover:text-crow-800'}"
			>
				封存信笺 ({$sealedLetters.length})
			</button>
		</div>

		<!-- 信笺列表 -->
		<div class="max-w-4xl mx-auto">
			{#if selectedTab === 'active'}
				{#if $activeLetters.length === 0}
					<div class="text-center py-16">
						<Feather class="w-16 h-16 text-dove-400 mx-auto mb-4" />
						<h3 class="text-xl text-crow-600 mb-2">还没有活跃的信笺</h3>
						<p class="text-crow-500 mb-6">开始写下你的第一封信笺吧</p>
						<a href="/write" class="dove-button">写信</a>
					</div>
				{:else}
					<div class="grid gap-6">
						{#each $activeLetters as letter (letter.id)}
							<div class="letter-paper p-6 hover:shadow-lg transition-shadow">
								<div class="flex items-start justify-between mb-4">
									<div class="flex-1">
										<h3 class="text-xl font-serif text-crow-800 mb-2">{letter.title}</h3>
										<div class="flex items-center text-sm text-crow-500 space-x-4">
											<div class="flex items-center">
												<Calendar class="w-4 h-4 mr-1" />
												{formatDate(letter.createdAt)}
											</div>
											{#if letter.recipient}
												<div class="flex items-center">
													<User class="w-4 h-4 mr-1" />
													{letter.recipient}
												</div>
											{/if}
										</div>
									</div>
								</div>

								<p class="text-crow-700 leading-relaxed mb-6">
									{truncateContent(letter.content)}
								</p>

								<div class="flex items-center justify-between">
									<div class="flex space-x-3">
										<button 
											onclick={() => viewLetter(letter)}
											class="flex items-center text-dove-600 hover:text-dove-700 transition-colors"
										>
											<Eye class="w-4 h-4 mr-1" />
											查看
										</button>
										<button 
											onclick={() => editLetter(letter)}
											class="flex items-center text-blue-600 hover:text-blue-700 transition-colors"
										>
											<Edit class="w-4 h-4 mr-1" />
											编辑
										</button>
									</div>

									<div class="flex space-x-3">
										<button 
											onclick={() => openCeremonyModal(letter, 'dove')}
											class="flex items-center text-amber-600 hover:text-amber-700 transition-colors"
										>
											<Feather class="w-4 h-4 mr-1" />
											放飞白鸽
										</button>
										<button 
											onclick={() => openCeremonyModal(letter, 'sea')}
											class="flex items-center text-red-600 hover:text-red-700 transition-colors"
										>
											<Waves class="w-4 h-4 mr-1" />
											沉入深海
										</button>
									</div>
								</div>
							</div>
						{/each}
					</div>
				{/if}
			{:else}
				{#if $sealedLetters.length === 0}
					<div class="text-center py-16">
						<Feather class="w-16 h-16 text-amber-400 mx-auto mb-4" />
						<h3 class="text-xl text-crow-600 mb-2">还没有封存的信笺</h3>
						<p class="text-crow-500">当你准备好告别时，可以选择放飞白鸽来封存回忆</p>
					</div>
				{:else}
					<div class="grid gap-6">
						{#each $sealedLetters as letter (letter.id)}
							<div class="letter-paper p-6 bg-amber-50/50 border-amber-200">
								<div class="flex items-start justify-between mb-4">
									<div class="flex-1">
										<h3 class="text-xl font-serif text-crow-800 mb-2">{letter.title}</h3>
										<div class="flex items-center text-sm text-crow-500 space-x-4">
											<div class="flex items-center">
												<Calendar class="w-4 h-4 mr-1" />
												{formatDate(letter.createdAt)}
											</div>
											{#if letter.recipient}
												<div class="flex items-center">
													<User class="w-4 h-4 mr-1" />
													{letter.recipient}
												</div>
											{/if}
											<div class="flex items-center text-amber-600">
												<Feather class="w-4 h-4 mr-1" />
												已封存
											</div>
										</div>
									</div>
								</div>

								<p class="text-crow-700 leading-relaxed mb-6">
									{truncateContent(letter.content)}
								</p>

								<div class="flex items-center justify-between">
									<button 
										onclick={() => viewLetter(letter)}
										class="flex items-center text-dove-600 hover:text-dove-700 transition-colors"
									>
										<Eye class="w-4 h-4 mr-1" />
										查看
									</button>

									<span class="text-sm text-amber-600 italic">
										白鸽已飞走，回忆已封存
									</span>
								</div>
							</div>
						{/each}
					</div>
				{/if}
			{/if}
		</div>
	</div>
</div>

<!-- 告别仪式模态框 -->
{#if showCeremonyModal && selectedLetter && ceremonyType}
	<div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
		<div class="letter-paper max-w-md w-full p-6">
			<h3 class="text-xl font-serif text-crow-800 mb-4">
				{ceremonyType === 'dove' ? '放飞白鸽' : '沉入深海'}
			</h3>
			
			<p class="text-crow-600 mb-4">
				{ceremonyType === 'dove' 
					? '白鸽将带走这封信笺，将其永远封存。你将无法再编辑，但可以随时查看这份回忆。'
					: '信笺将沉入深海，彻底消失。这个过程不可逆转，请慎重考虑。'
				}
			</p>

			<div class="mb-6">
				<label for="ceremony-message" class="block text-sm text-crow-600 mb-2">告别留言（可选）:</label>
				<textarea
					id="ceremony-message"
					bind:value={ceremonyMessage}
					placeholder="在告别时，你想说些什么..."
					class="w-full h-20 p-3 border border-dove-200 rounded-lg resize-none"
				></textarea>
			</div>

			<div class="flex space-x-3">
				<button 
					onclick={closeCeremonyModal}
					class="flex-1 py-2 px-4 border border-dove-300 text-crow-600 rounded-lg hover:bg-dove-50 transition-colors"
				>
					取消
				</button>
				<button 
					onclick={performCeremony}
					disabled={isPerformingCeremony}
					class="flex-1 py-2 px-4 rounded-lg text-white transition-colors {ceremonyType === 'dove' ? 'bg-amber-600 hover:bg-amber-700' : 'bg-red-600 hover:bg-red-700'}"
				>
					{isPerformingCeremony ? '执行中...' : (ceremonyType === 'dove' ? '放飞白鸽' : '沉入深海')}
				</button>
			</div>
		</div>
	</div>
{/if}

<!-- 告别仪式动画 -->
<FarewellCeremony
	type={ceremonyType || 'dove'}
	isVisible={showCeremonyAnimation}
	letterTitle={selectedLetter?.title || ''}
	on:complete={handleCeremonyComplete}
	on:close={handleCeremonyClose}
/>
